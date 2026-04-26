import { fetchCollectionV1, getCreateCollectionV2Instruction, getCreateV2Instruction } from '@obrera/mpl-core-kit-lib'
import {
  type Address,
  address,
  appendTransactionMessageInstructions,
  assertIsTransactionMessageWithSingleSendingSigner,
  createTransactionMessage,
  generateKeyPairSigner,
  getBase58Decoder,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signAndSendTransactionMessageWithSigners,
  type TransactionSendingSigner,
} from '@solana/kit'

import { type MplCoreCreateDraft } from '@/mpl-core/data-access/mpl-core-create-draft'
import { getMplCoreCreatePluginArgs } from '@/mpl-core/data-access/mpl-core-create-plugin-args'
import { type SolanaClient } from '@/solana/data-access/solana-client'

export async function executeMplCoreAssetCreate({
  client,
  draft,
  walletSigner,
}: {
  client: SolanaClient
  draft: MplCoreCreateDraft
  walletSigner: TransactionSendingSigner<string>
}) {
  const {
    assetExternalPluginAdapters,
    assetPluginAuthorityPairs,
    collectionExternalPluginAdapters,
    collectionPluginAuthorityPairs,
  } = getMplCoreCreatePluginArgs(draft)

  let collectionAddress: Address | undefined
  let collectionSigner: Awaited<ReturnType<typeof generateKeyPairSigner>> | undefined

  if (draft.collection.mode === 'Existing') {
    const existingCollectionAddress = address(draft.collection.address.trim())
    await fetchCollectionV1(client.rpc, existingCollectionAddress)
    collectionAddress = existingCollectionAddress
  }

  if (draft.collection.mode === 'New') {
    collectionSigner = await generateKeyPairSigner()
    collectionAddress = collectionSigner.address
  }

  const assetSigner = await generateKeyPairSigner()
  const assetInstruction = getCreateV2Instruction(
    getMplCoreAssetCreateInstructionInput({
      assetExternalPluginAdapters,
      assetPluginAuthorityPairs,
      assetSigner,
      collectionAddress,
      draft,
      walletSigner,
    }),
  )
  const collectionInstruction = collectionSigner
    ? getCreateCollectionV2Instruction({
        collection: collectionSigner,
        externalPluginAdapters: collectionExternalPluginAdapters,
        name: draft.collection.name.trim(),
        payer: walletSigner,
        plugins: collectionPluginAuthorityPairs,
        updateAuthority: walletSigner.address,
        uri: draft.collection.uri.trim(),
      })
    : undefined
  const instructions = collectionInstruction ? [collectionInstruction, assetInstruction] : [assetInstruction]

  const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()

  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (transactionMessage) => setTransactionMessageFeePayerSigner(walletSigner, transactionMessage),
    (transactionMessage) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, transactionMessage),
    (transactionMessage) => appendTransactionMessageInstructions(instructions, transactionMessage),
  )

  assertIsTransactionMessageWithSingleSendingSigner(message)

  const signatureBytes = await signAndSendTransactionMessageWithSigners(message)
  const signature = getBase58Decoder().decode(signatureBytes)

  return {
    assetAddress: assetSigner.address,
    collectionAddress,
    signature,
  }
}

export function getMplCoreAssetCreateInstructionInput({
  assetExternalPluginAdapters,
  assetPluginAuthorityPairs,
  assetSigner,
  collectionAddress,
  draft,
  walletSigner,
}: {
  assetExternalPluginAdapters: ReturnType<typeof getMplCoreCreatePluginArgs>['assetExternalPluginAdapters']
  assetPluginAuthorityPairs: ReturnType<typeof getMplCoreCreatePluginArgs>['assetPluginAuthorityPairs']
  assetSigner: Awaited<ReturnType<typeof generateKeyPairSigner>>
  collectionAddress?: Address
  draft: MplCoreCreateDraft
  walletSigner: TransactionSendingSigner<string>
}) {
  return {
    asset: assetSigner,
    authority: walletSigner,
    collection: collectionAddress,
    externalPluginAdapters: assetExternalPluginAdapters,
    name: draft.name.trim(),
    owner: draft.owner.trim() ? address(draft.owner.trim()) : undefined,
    payer: walletSigner,
    plugins: assetPluginAuthorityPairs,
    updateAuthority: collectionAddress ? undefined : walletSigner.address,
    uri: draft.uri.trim(),
  }
}
