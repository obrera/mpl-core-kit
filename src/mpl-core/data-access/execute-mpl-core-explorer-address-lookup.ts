import { fetchAssetV1, fetchCollectionV1 } from '@obrera/mpl-core-kit-lib'
import { address } from '@solana/kit'

import { type SolanaClient } from '@/solana/data-access/solana-client'

export type MplCoreExplorerAddressLookupResult =
  | {
      address: string
      kind: 'asset'
    }
  | {
      address: string
      kind: 'collection'
    }

export async function executeMplCoreExplorerAddressLookup({
  client,
  value,
}: {
  client: SolanaClient
  value: string
}): Promise<MplCoreExplorerAddressLookupResult | null> {
  const trimmedValue = value.trim()
  const accountAddress = address(trimmedValue)

  try {
    const asset = await fetchAssetV1(client.rpc, accountAddress)
    return {
      address: asset.address,
      kind: 'asset',
    }
  } catch {
    // Not an asset account at this address.
  }

  try {
    const collection = await fetchCollectionV1(client.rpc, accountAddress)
    return {
      address: collection.address,
      kind: 'collection',
    }
  } catch {
    // Not a collection account at this address.
  }

  return null
}
