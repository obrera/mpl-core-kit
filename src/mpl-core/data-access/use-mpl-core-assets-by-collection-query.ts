import { address } from '@solana/kit'
import { useQuery } from '@tanstack/react-query'
import { useWalletUi } from '@wallet-ui/react'
import { fetchAssetsByCollection } from 'mpl-core-kit-lib'

import { isValidAddress } from '@/mpl-core/data-access/mpl-core-create-draft'
import { fetchMplCoreAssetRecords } from '@/mpl-core/data-access/mpl-core-explorer-records'
import { useSolanaClient } from '@/solana/data-access/use-solana-client'

export function useMplCoreAssetsByCollectionQuery({ collectionAddress }: { collectionAddress: string }) {
  const client = useSolanaClient()
  const { cluster } = useWalletUi()
  const trimmedAddress = collectionAddress.trim()

  return useQuery(
    getMplCoreAssetsByCollectionQueryOptions({
      client,
      clusterId: cluster.id,
      collectionAddress: trimmedAddress,
    }),
  )
}

function getMplCoreAssetsByCollectionQueryOptions({
  client,
  clusterId,
  collectionAddress,
}: {
  client: ReturnType<typeof useSolanaClient>
  clusterId: string
  collectionAddress: string
}) {
  // client.rpc is derived from the selected cluster and should not participate in cache identity.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return {
    enabled: isValidAddress(collectionAddress),
    queryFn: async () => {
      const assetAccounts = await fetchAssetsByCollection(client.rpc, address(collectionAddress))
      const assetRecords = await fetchMplCoreAssetRecords({
        client,
        recordAddresses: assetAccounts.map((account) => account.address),
      })

      return [...assetRecords].sort(
        (left, right) => left.data.name.localeCompare(right.data.name) || left.address.localeCompare(right.address),
      )
    },
    queryKey: ['mpl-core-assets-by-collection', clusterId, collectionAddress],
    retry: false,
    staleTime: 30_000,
  }
}
