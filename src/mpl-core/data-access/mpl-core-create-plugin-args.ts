import { address } from '@solana/kit'
import {
  type BaseExternalPluginAdapterInitInfoArgs,
  basePluginAuthority,
  baseRuleSet,
  CheckResult,
  createExternalPluginAdapterInitInfo,
  type ExtraAccount,
  plugin,
  type PluginAuthorityPairArgs,
  type Seed,
  type ValidationResultsOffset,
} from 'mpl-core-kit-lib'

import {
  type MplCoreCreateDraft,
  type MplCoreCreateFieldErrors,
  type MplCoreExtraAccountDraft,
  type MplCoreOracleDraft,
  type MplCorePluginsDraft,
  type MplCoreSeedDraft,
  normalizeAddressList,
  parseByteList,
} from '@/mpl-core/data-access/mpl-core-create-draft'

export function getMplCoreCreatePluginArgs(draft: MplCoreCreateDraft) {
  const asset = mapPluginAuthorityPairs(draft.assetPlugins, { collection: false })
  const collection = mapPluginAuthorityPairs(draft.collection.plugins, { collection: true })

  return {
    assetExternalPluginAdapters: asset.externalPluginAdapters,
    assetPluginAuthorityPairs: asset.pluginAuthorityPairs,
    collectionExternalPluginAdapters: collection.externalPluginAdapters,
    collectionPluginAuthorityPairs: collection.pluginAuthorityPairs,
  }
}

export function getMplCoreFieldError(errors: MplCoreCreateFieldErrors, path: string) {
  return errors[path]
}

function getAddressAuthority(value: string) {
  return basePluginAuthority('Address', { address: address(value.trim()) })
}

function mapExtraAccountDraft(accountDraft: MplCoreExtraAccountDraft): ExtraAccount | undefined {
  if (accountDraft.type === 'None') {
    return undefined
  }

  if (accountDraft.type === 'Address') {
    return {
      address: address(accountDraft.address.trim()),
      isSigner: accountDraft.isSigner,
      isWritable: accountDraft.isWritable,
      type: 'Address',
    }
  }

  if (accountDraft.type === 'CustomPda') {
    return {
      customProgramId: accountDraft.customProgramId.trim() ? address(accountDraft.customProgramId.trim()) : undefined,
      isSigner: accountDraft.isSigner,
      isWritable: accountDraft.isWritable,
      seeds: accountDraft.seeds.map(mapSeedDraft),
      type: 'CustomPda',
    }
  }

  return {
    isSigner: accountDraft.isSigner,
    isWritable: accountDraft.isWritable,
    type: accountDraft.type,
  }
}

function mapOracleDraft(oracleDraft: MplCoreOracleDraft): BaseExternalPluginAdapterInitInfoArgs {
  const lifecycleChecks = oracleDraft.lifecycles.reduce<
    Record<'burn' | 'create' | 'transfer' | 'update', CheckResult[]>
  >(
    (accumulator, lifecycle) => {
      const key = lifecycle.toLowerCase() as 'burn' | 'create' | 'transfer' | 'update'
      accumulator[key] = [CheckResult.CAN_REJECT]
      return accumulator
    },
    {} as Record<'burn' | 'create' | 'transfer' | 'update', CheckResult[]>,
  )

  let resultsOffset: undefined | ValidationResultsOffset
  if (oracleDraft.resultsOffset.type === 'Custom') {
    resultsOffset = {
      offset: BigInt(oracleDraft.resultsOffset.offset),
      type: 'Custom',
    }
  } else {
    resultsOffset = { type: oracleDraft.resultsOffset.type }
  }

  return createExternalPluginAdapterInitInfo({
    baseAddress: address(oracleDraft.baseAddress.trim()),
    baseAddressConfig: mapExtraAccountDraft(oracleDraft.baseAddressConfig),
    lifecycleChecks,
    resultsOffset,
    type: 'Oracle',
  })
}

function mapPluginAuthorityPairs(pluginDraft: MplCorePluginsDraft, { collection }: { collection: boolean }) {
  const pluginAuthorityPairs: PluginAuthorityPairArgs[] = []
  const externalPluginAdapters: BaseExternalPluginAdapterInitInfoArgs[] = []

  if (pluginDraft.royalties.enabled) {
    const programs = normalizeAddressList(pluginDraft.royalties.programs).map((value) => address(value))
    const ruleSet =
      pluginDraft.royalties.ruleSet === 'Allow list'
        ? baseRuleSet('ProgramAllowList', [programs])
        : pluginDraft.royalties.ruleSet === 'Deny list'
          ? baseRuleSet('ProgramDenyList', [programs])
          : baseRuleSet('None')

    pluginAuthorityPairs.push({
      authority: basePluginAuthority('None'),
      plugin: plugin('Royalties', [
        {
          basisPoints: Number(pluginDraft.royalties.basisPoints),
          creators: pluginDraft.royalties.creators.map((creator) => ({
            address: address(creator.address.trim()),
            percentage: Number(creator.percentage),
          })),
          ruleSet,
        },
      ]),
    })
  }

  if (pluginDraft.soulbound.enabled) {
    pluginAuthorityPairs.push({
      authority: basePluginAuthority('None'),
      plugin: plugin('PermanentFreezeDelegate', [{ frozen: true }]),
    })
  }

  if (pluginDraft.attributes.enabled) {
    pluginAuthorityPairs.push({
      authority: basePluginAuthority('None'),
      plugin: plugin('Attributes', [
        {
          attributeList: pluginDraft.attributes.items.map((item) => ({
            key: item.key.trim(),
            value: item.value.trim(),
          })),
        },
      ]),
    })
  }

  if (pluginDraft.update.enabled) {
    pluginAuthorityPairs.push({
      authority: getAddressAuthority(pluginDraft.update.authority),
      plugin: plugin('UpdateDelegate', [{ additionalDelegates: [] }]),
    })
  }

  if (pluginDraft.permanentFreeze.enabled) {
    pluginAuthorityPairs.push({
      authority: getAddressAuthority(pluginDraft.permanentFreeze.authority),
      plugin: plugin('PermanentFreezeDelegate', [{ frozen: pluginDraft.permanentFreeze.frozen }]),
    })
  }

  if (pluginDraft.permanentTransfer.enabled) {
    pluginAuthorityPairs.push({
      authority: getAddressAuthority(pluginDraft.permanentTransfer.authority),
      plugin: plugin('PermanentTransferDelegate', [{}]),
    })
  }

  if (pluginDraft.permanentBurn.enabled) {
    pluginAuthorityPairs.push({
      authority: getAddressAuthority(pluginDraft.permanentBurn.authority),
      plugin: plugin('PermanentBurnDelegate', [{}]),
    })
  }

  if (pluginDraft.oracle.enabled) {
    pluginDraft.oracle.items.forEach((oracle) => externalPluginAdapters.push(mapOracleDraft(oracle)))
  }

  if (!collection && pluginDraft.edition.enabled) {
    pluginAuthorityPairs.push({
      authority: basePluginAuthority('None'),
      plugin: plugin('Edition', [{ number: Number(pluginDraft.edition.number) }]),
    })
  }

  if (collection && pluginDraft.masterEdition.enabled) {
    pluginAuthorityPairs.push({
      authority: basePluginAuthority('None'),
      plugin: plugin('MasterEdition', [
        {
          maxSupply: pluginDraft.masterEdition.maxSupply.trim() ? Number(pluginDraft.masterEdition.maxSupply) : null,
          name: pluginDraft.masterEdition.name.trim() || null,
          uri: pluginDraft.masterEdition.uri.trim() || null,
        },
      ]),
    })
  }

  return { externalPluginAdapters, pluginAuthorityPairs }
}

function mapSeedDraft(seedDraft: MplCoreSeedDraft): Seed {
  if (seedDraft.type === 'Address') {
    return {
      pubkey: address(seedDraft.value.trim()),
      type: 'Address',
    }
  }

  if (seedDraft.type === 'Bytes') {
    return {
      bytes: parseByteList(seedDraft.value),
      type: 'Bytes',
    }
  }

  return { type: seedDraft.type }
}
