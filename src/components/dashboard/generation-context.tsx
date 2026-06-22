"use client";



import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useState,

  type ReactNode,

} from "react";

import type { DerivativeAction, GenerationHistoryEntry, StoredAsset } from "@/types/generation";



const DEFAULT_CHARACTER_ID =

  process.env.NEXT_PUBLIC_DEMO_CHARACTER_ID ??

  "00000000-0000-4000-8000-000000000001";



export interface CharacterSummary {

  id: string;

  name: string;

  age?: number;

  contentNiche?: string;

  occupation?: string;

  location?: string;

  campaign?: string;

  mood?: string;

  worldName?: string;

  traits?: string[];

  portraitUrl?: string;

  avatarUrl?: string;

}



export interface GenerationResultData {

  briefId: string;

  jobId: string;

  asset: StoredAsset;

  brief: Record<string, unknown>;

  model: string;

  modelReason: string;

  followUpActions: DerivativeAction[];

  provider?: string;

  mock?: boolean;

}



interface GenerationContextValue {

  characterId: string;

  character: CharacterSummary | null;

  characters: CharacterSummary[];

  assets: StoredAsset[];

  history: GenerationHistoryEntry[];

  loading: boolean;

  generating: string | null;

  lastResult: GenerationResultData | null;

  provider: string;

  stats: {

    posts: number;

    reels: number;

    campaigns: number;

    assetsThisMonth: number;

    readyToPublish: number;

  };

  generate: (action: string) => Promise<void>;

  derive: (assetId: string, action: DerivativeAction) => Promise<void>;

  createCharacter: (input: { name: string; age?: number; city?: string }) => Promise<void>;

  selectCharacter: (id: string) => void;

  refresh: () => Promise<void>;

}



const GenerationContext = createContext<GenerationContextValue | null>(null);



export function GenerationProvider({ children }: { children: ReactNode }) {

  const [characterId, setCharacterId] = useState(DEFAULT_CHARACTER_ID);

  const [character, setCharacter] = useState<CharacterSummary | null>(null);

  const [characters, setCharacters] = useState<CharacterSummary[]>([]);

  const [assets, setAssets] = useState<StoredAsset[]>([]);

  const [history, setHistory] = useState<GenerationHistoryEntry[]>([]);

  const [loading, setLoading] = useState(true);

  const [generating, setGenerating] = useState<string | null>(null);

  const [lastResult, setLastResult] = useState<GenerationResultData | null>(null);

  const [provider, setProvider] = useState("mock");



  const loadCharacter = useCallback(async (id: string) => {

    const res = await fetch(`/api/characters/${id}`);

    const json = await res.json();

    if (!json.success) return null;

    const d = json.data;

    return {

      id: d.id,

      name: d.name,

      age: d.age,

      contentNiche: d.contentNiche,

      occupation: d.occupation,

      location: d.world?.city,

      campaign: d.campaign?.title,

      mood: d.bible?.personality ? "Cozy Luxury" : undefined,

      worldName: d.world?.name,

      traits: d.traits,

    } as CharacterSummary;

  }, []);



  const refresh = useCallback(async () => {

    setLoading(true);

    try {

      const [charsRes, assetsRes, historyRes] = await Promise.all([

        fetch("/api/characters"),

        fetch(`/api/assets?characterId=${characterId}`),

        fetch(`/api/generation/history?characterId=${characterId}`),

      ]);

      const charsJson = await charsRes.json();

      const assetsJson = await assetsRes.json();

      const historyJson = await historyRes.json();



      if (charsJson.success) {

        setCharacters(charsJson.data);

        const active = charsJson.data.find((c: CharacterSummary) => c.id === characterId);

        if (active) {

          const full = await loadCharacter(characterId);

          setCharacter(full);

        }

      }

      if (assetsJson.success) setAssets(assetsJson.data);

      if (historyJson.success) setHistory(historyJson.data);

    } finally {

      setLoading(false);

    }

  }, [characterId, loadCharacter]);



  useEffect(() => {

    refresh();

  }, [refresh]);



  const createCharacter = useCallback(

    async (input: { name: string; age?: number; city?: string }) => {

      const res = await fetch("/api/characters", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ name: input.name, age: input.age, city: input.city, mode: "quick" }),

      });

      const json = await res.json();

      if (!json.success) throw new Error(json.error);

      setCharacterId(json.data.id);

      await refresh();

    },

    [refresh]

  );



  const selectCharacter = useCallback((id: string) => {

    setCharacterId(id);

  }, []);



  useEffect(() => {

    loadCharacter(characterId).then((c) => {

      if (c) setCharacter(c);

    });

    fetch(`/api/assets?characterId=${characterId}`)

      .then((r) => r.json())

      .then((j) => j.success && setAssets(j.data));

    fetch(`/api/generation/history?characterId=${characterId}`)

      .then((r) => r.json())

      .then((j) => j.success && setHistory(j.data));

  }, [characterId, loadCharacter]);



  const generate = useCallback(

    async (action: string) => {

      setGenerating(action);

      try {

        const res = await fetch("/api/generate", {

          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({ characterId, action }),

        });

        const json = await res.json();

        if (!json.success) throw new Error(json.error);

        setLastResult(json.data);

        if (json.data.provider) setProvider(json.data.provider);

        await refresh();

      } catch (err) {

        console.error(err);

        alert(err instanceof Error ? err.message : "Generation failed");

      } finally {

        setGenerating(null);

      }

    },

    [characterId, refresh]

  );



  const derive = useCallback(

    async (assetId: string, action: DerivativeAction) => {

      setGenerating(action);

      try {

        const res = await fetch(`/api/assets/${assetId}/derive`, {

          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({ characterId, action }),

        });

        const json = await res.json();

        if (!json.success) throw new Error(json.error);

        setLastResult(json.data);

        await refresh();

      } catch (err) {

        alert(err instanceof Error ? err.message : "Derivation failed");

      } finally {

        setGenerating(null);

      }

    },

    [characterId, refresh]

  );



  const posts = assets.filter((a) => a.type === "IMAGE").length;

  const reels = assets.filter((a) => a.type === "VIDEO").length;

  const campaignCount = new Set(assets.map((a) => a.campaignId).filter(Boolean)).size;



  return (

    <GenerationContext.Provider

      value={{

        characterId,

        character,

        characters,

        assets,

        history,

        loading,

        generating,

        lastResult,

        provider,

        stats: {

          posts,

          reels,

          campaigns: campaignCount || (character?.campaign ? 1 : 0),

          assetsThisMonth: assets.length,

          readyToPublish: assets.length,

        },

        generate,

        derive,

        createCharacter,

        selectCharacter,

        refresh,

      }}

    >

      {children}

    </GenerationContext.Provider>

  );

}



export function useGeneration() {

  const ctx = useContext(GenerationContext);

  if (!ctx) throw new Error("useGeneration must be used within GenerationProvider");

  return ctx;

}


