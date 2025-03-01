/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STORY_RPC_URL: string
  readonly VITE_SPG_NFT_CONTRACT_ADDRESS: string
  readonly VITE_ROYALTY_POLICY_LAP: string
  readonly VITE_WIP_TOKEN_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 