import {
  type Account,
  type Address,
  assertAccountExists,
  assertAccountsExist,
  decodeAccount,
  fetchEncodedAccount,
  fetchEncodedAccounts,
} from '@solana/kit'
import {
  type AssetV1AccountData,
  type CollectionV1AccountData,
  type ExternalPluginAdaptersList,
  externalRegistryRecordsToExternalPluginAdapterList,
  getAssetV1AccountDataDecoder,
  getCollectionV1AccountDataDecoder,
  getPluginRegistryV1AccountDataDecoder,
  registryRecordsToPluginsList,
} from 'mpl-core-kit-lib'

import { type SolanaClient } from '@/solana/data-access/solana-client'

export type MplCoreAssetRecord = Account<AssetV1AccountData & ExternalPluginAdaptersList>
export type MplCoreCollectionRecord = Account<CollectionV1AccountData & ExternalPluginAdaptersList>

export async function fetchMplCoreAssetRecord({
  client,
  recordAddress,
}: {
  client: SolanaClient
  recordAddress: Address
}): Promise<MplCoreAssetRecord> {
  const encodedAccount = await fetchEncodedAccount(client.rpc, recordAddress)
  assertAccountExists(encodedAccount)

  const decodedAccount = decodeAccount(encodedAccount, getAssetV1AccountDataDecoder())

  return {
    ...decodedAccount,
    data: {
      ...decodedAccount.data,
      ...getExpandedExternalPluginAdapters({
        accountData: encodedAccount.data,
        pluginRegistryOffset: decodedAccount.data.pluginHeader?.pluginRegistryOffset,
      }),
      ...getExpandedPlugins({
        accountData: encodedAccount.data,
        pluginRegistryOffset: decodedAccount.data.pluginHeader?.pluginRegistryOffset,
      }),
    },
  }
}

export async function fetchMplCoreAssetRecords({
  client,
  recordAddresses,
}: {
  client: SolanaClient
  recordAddresses: Address[]
}): Promise<MplCoreAssetRecord[]> {
  if (recordAddresses.length === 0) {
    return []
  }

  const encodedAccounts = await fetchEncodedAccounts(client.rpc, recordAddresses)
  assertAccountsExist(encodedAccounts)

  return encodedAccounts.map((encodedAccount) => {
    const decodedAccount = decodeAccount(encodedAccount, getAssetV1AccountDataDecoder())

    return {
      ...decodedAccount,
      data: {
        ...decodedAccount.data,
        ...getExpandedExternalPluginAdapters({
          accountData: encodedAccount.data,
          pluginRegistryOffset: decodedAccount.data.pluginHeader?.pluginRegistryOffset,
        }),
        ...getExpandedPlugins({
          accountData: encodedAccount.data,
          pluginRegistryOffset: decodedAccount.data.pluginHeader?.pluginRegistryOffset,
        }),
      },
    }
  })
}

export async function fetchMplCoreCollectionRecord({
  client,
  recordAddress,
}: {
  client: SolanaClient
  recordAddress: Address
}): Promise<MplCoreCollectionRecord> {
  const encodedAccount = await fetchEncodedAccount(client.rpc, recordAddress)
  assertAccountExists(encodedAccount)

  const decodedAccount = decodeAccount(encodedAccount, getCollectionV1AccountDataDecoder())

  return {
    ...decodedAccount,
    data: {
      ...decodedAccount.data,
      ...getExpandedExternalPluginAdapters({
        accountData: encodedAccount.data,
        pluginRegistryOffset: decodedAccount.data.pluginHeader?.pluginRegistryOffset,
      }),
      ...getExpandedPlugins({
        accountData: encodedAccount.data,
        pluginRegistryOffset: decodedAccount.data.pluginHeader?.pluginRegistryOffset,
      }),
    },
  }
}

export async function fetchMplCoreCollectionRecords({
  client,
  recordAddresses,
}: {
  client: SolanaClient
  recordAddresses: Address[]
}): Promise<MplCoreCollectionRecord[]> {
  if (recordAddresses.length === 0) {
    return []
  }

  const encodedAccounts = await fetchEncodedAccounts(client.rpc, recordAddresses)
  assertAccountsExist(encodedAccounts)

  return encodedAccounts.map((encodedAccount) => {
    const decodedAccount = decodeAccount(encodedAccount, getCollectionV1AccountDataDecoder())

    return {
      ...decodedAccount,
      data: {
        ...decodedAccount.data,
        ...getExpandedExternalPluginAdapters({
          accountData: encodedAccount.data,
          pluginRegistryOffset: decodedAccount.data.pluginHeader?.pluginRegistryOffset,
        }),
        ...getExpandedPlugins({
          accountData: encodedAccount.data,
          pluginRegistryOffset: decodedAccount.data.pluginHeader?.pluginRegistryOffset,
        }),
      },
    }
  })
}

function getExpandedExternalPluginAdapters({
  accountData,
  pluginRegistryOffset,
}: {
  accountData: Uint8Array
  pluginRegistryOffset?: bigint
}) {
  if (pluginRegistryOffset === undefined) {
    return {}
  }

  const [pluginRegistry] = getPluginRegistryV1AccountDataDecoder().read(accountData, Number(pluginRegistryOffset))
  return externalRegistryRecordsToExternalPluginAdapterList(pluginRegistry.externalRegistry, accountData)
}

function getExpandedPlugins({
  accountData,
  pluginRegistryOffset,
}: {
  accountData: Uint8Array
  pluginRegistryOffset?: bigint
}) {
  if (pluginRegistryOffset === undefined) {
    return {}
  }

  const [pluginRegistry] = getPluginRegistryV1AccountDataDecoder().read(accountData, Number(pluginRegistryOffset))
  return registryRecordsToPluginsList(pluginRegistry.registry, accountData)
}
