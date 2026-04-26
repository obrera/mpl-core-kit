import { fetchAssetsByOwner } from '@obrera/mpl-core-kit-lib'
import { address } from '@solana/kit'
import { useQuery } from '@tanstack/react-query'
import { useWalletUi } from '@wallet-ui/react'

import { isValidAddress } from '@/mpl-core/data-access/mpl-core-create-draft'
import { fetchMplCoreAssetRecords } from '@/mpl-core/data-access/mpl-core-explorer-records'
import { useSolanaClient } from '@/solana/data-access/use-solana-client'

export function useMplCoreAssetsByOwnerQuery({ ownerAddress }: { ownerAddress: string }) {
  const client = useSolanaClient()
  const { cluster } = useWalletUi()
  const trimmedAddress = ownerAddress.trim()

  return useQuery(
    getMplCoreAssetsByOwnerQueryOptions({
      client,
      clusterId: cluster.id,
      ownerAddress: trimmedAddress,
    }),
  )
}

function getMplCoreAssetsByOwnerQueryOptions({
  client,
  clusterId,
  ownerAddress,
}: {
  client: ReturnType<typeof useSolanaClient>
  clusterId: string
  ownerAddress: string
}) {
  // client.rpc is derived from the selected cluster and should not participate in cache identity.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return {
    enabled: isValidAddress(ownerAddress),
    queryFn: async () => {
      const assetAccounts = await fetchAssetsByOwner(client.rpc, address(ownerAddress))
      const assetRecords = await fetchMplCoreAssetRecords({
        client,
        recordAddresses: assetAccounts.map((account) => account.address),
      })

      return [...assetRecords].sort(
        (left, right) => left.data.name.localeCompare(right.data.name) || left.address.localeCompare(right.address),
      )
    },
    queryKey: ['mpl-core-assets-by-owner', clusterId, ownerAddress],
    retry: false,
    staleTime: 30_000,
  }
}
