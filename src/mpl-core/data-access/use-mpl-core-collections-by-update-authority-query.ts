import { address } from '@solana/kit'
import { useQuery } from '@tanstack/react-query'
import { useWalletUi } from '@wallet-ui/react'
import { fetchCollectionsByUpdateAuthority } from 'mpl-core-kit-lib'

import { isValidAddress } from '@/mpl-core/data-access/mpl-core-create-draft'
import { fetchMplCoreCollectionRecords } from '@/mpl-core/data-access/mpl-core-explorer-records'
import { useSolanaClient } from '@/solana/data-access/use-solana-client'

export function useMplCoreCollectionsByUpdateAuthorityQuery({
  updateAuthorityAddress,
}: {
  updateAuthorityAddress: string
}) {
  const client = useSolanaClient()
  const { cluster } = useWalletUi()
  const trimmedAddress = updateAuthorityAddress.trim()

  return useQuery(
    getMplCoreCollectionsByUpdateAuthorityQueryOptions({
      client,
      clusterId: cluster.id,
      updateAuthorityAddress: trimmedAddress,
    }),
  )
}

function getMplCoreCollectionsByUpdateAuthorityQueryOptions({
  client,
  clusterId,
  updateAuthorityAddress,
}: {
  client: ReturnType<typeof useSolanaClient>
  clusterId: string
  updateAuthorityAddress: string
}) {
  // client.rpc is derived from the selected cluster and should not participate in cache identity.
  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  return {
    enabled: isValidAddress(updateAuthorityAddress),
    queryFn: async () => {
      const collectionAccounts = await fetchCollectionsByUpdateAuthority(client.rpc, address(updateAuthorityAddress))
      const collectionRecords = await fetchMplCoreCollectionRecords({
        client,
        recordAddresses: collectionAccounts.map((account) => account.address),
      })

      return [...collectionRecords].sort(
        (left, right) => left.data.name.localeCompare(right.data.name) || left.address.localeCompare(right.address),
      )
    },
    queryKey: ['mpl-core-collections-by-update-authority', clusterId, updateAuthorityAddress],
    retry: false,
    staleTime: 30_000,
  }
}
