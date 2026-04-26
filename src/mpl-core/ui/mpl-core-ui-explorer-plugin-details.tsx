import {
  type ExternalPluginAdaptersList,
  type PluginAuthority,
  type PluginsList,
  type UpdateAuthority,
} from '@obrera/mpl-core-kit-lib'
import { PuzzleIcon } from 'lucide-react'

import { Badge } from '@/core/ui/badge'
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/core/ui/empty'
import { MplCoreUiExplorerStat } from '@/mpl-core/ui/mpl-core-ui-explorer-stat'

export function MplCoreUiExplorerPluginDetails({
  plugins,
  type,
}: {
  plugins: Partial<ExternalPluginAdaptersList & PluginsList>
  type: 'asset' | 'collection'
}) {
  const frozen = Boolean(plugins.freezeDelegate?.frozen || plugins.permanentFreezeDelegate?.frozen)
  const hasPluginData = Boolean(
    plugins.addBlocker ||
    plugins.appDatas?.length ||
    plugins.attributes ||
    plugins.autograph ||
    plugins.bubblegumV2 ||
    plugins.burnDelegate ||
    plugins.dataSections?.length ||
    plugins.edition ||
    plugins.freezeDelegate ||
    plugins.freezeExecute ||
    plugins.immutableMetadata ||
    plugins.lifecycleHooks?.length ||
    plugins.linkedAppDatas?.length ||
    plugins.linkedLifecycleHooks?.length ||
    plugins.masterEdition ||
    plugins.oracles?.length ||
    plugins.permanentBurnDelegate ||
    plugins.permanentFreezeDelegate ||
    plugins.permanentFreezeExecute ||
    plugins.permanentTransferDelegate ||
    plugins.royalties ||
    plugins.transferDelegate ||
    plugins.updateDelegate ||
    plugins.verifiedCreators,
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <MplCoreUiExplorerStat label="Frozen" value={frozen ? 'Yes' : 'No'} />
      </div>

      {plugins.addBlocker ? (
        <PluginSection title="Add Blocker">
          <AuthorityStats authority={plugins.addBlocker.authority} label="Add Blocker" />
        </PluginSection>
      ) : null}

      {plugins.attributes ? (
        <PluginSection title="Attributes">
          <AuthorityStats authority={plugins.attributes.authority} label="Attributes" />
          <div className="grid gap-2">
            {[...plugins.attributes.attributeList]
              .sort((left, right) => left.key.localeCompare(right.key))
              .map((attribute) => (
                <MplCoreUiExplorerStat key={attribute.key} label={attribute.key} value={attribute.value} />
              ))}
          </div>
        </PluginSection>
      ) : null}

      {plugins.autograph ? (
        <PluginSection title="Autograph">
          <AuthorityStats authority={plugins.autograph.authority} label="Autograph" />
          <div className="grid gap-3">
            {[...plugins.autograph.signatures]
              .sort((left, right) => left.address.localeCompare(right.address))
              .map((signature) => (
                <div className="grid gap-3 rounded-lg border border-border/60 p-3" key={signature.address}>
                  <MplCoreUiExplorerStat copyValue={signature.address} label="Signer" value={signature.address} />
                  {signature.message ? <MplCoreUiExplorerStat label="Message" value={signature.message} /> : null}
                </div>
              ))}
          </div>
        </PluginSection>
      ) : null}

      {plugins.bubblegumV2 ? (
        <PluginSection title="Bubblegum V2">
          <AuthorityStats authority={plugins.bubblegumV2.authority} label="Bubblegum V2" />
        </PluginSection>
      ) : null}

      {plugins.burnDelegate ? (
        <PluginSection title="Burn Delegate">
          <AuthorityStats authority={plugins.burnDelegate.authority} label="Burn Delegate" />
        </PluginSection>
      ) : null}

      {plugins.dataSections?.length ? (
        <PluginSection title="Data Sections">
          <div className="grid gap-3">
            {plugins.dataSections.map((dataSection, index) => (
              <div className="grid gap-3 rounded-lg border border-border/60 p-3" key={`data-section-${index}`}>
                <AuthorityStats authority={dataSection.authority} label="Plugin" />
                {dataSection.dataAuthority ? (
                  <AuthorityStats authority={dataSection.dataAuthority} label="Data" />
                ) : null}
                <MplCoreUiExplorerStat label="Parent Type" value={dataSection.parentKey.type} />
                <MplCoreUiExplorerStat label="Schema" value={String(dataSection.schema)} />
                <JsonBlock label="Parent Key" value={dataSection.parentKey} />
                <JsonBlock label="Stored Data" value={dataSection.data} />
              </div>
            ))}
          </div>
        </PluginSection>
      ) : null}

      {plugins.edition ? (
        <PluginSection title="Edition">
          <MplCoreUiExplorerStat label="Edition Number" value={plugins.edition.number.toString()} />
          <AuthorityStats authority={plugins.edition.authority} label="Edition" />
        </PluginSection>
      ) : null}

      {plugins.freezeDelegate ? (
        <PluginSection title="Freeze Delegate">
          <MplCoreUiExplorerStat label="Frozen" value={plugins.freezeDelegate.frozen ? 'Yes' : 'No'} />
          <AuthorityStats authority={plugins.freezeDelegate.authority} label="Freeze Delegate" />
        </PluginSection>
      ) : null}

      {plugins.freezeExecute ? (
        <PluginSection title="Freeze Execute">
          <AuthorityStats authority={plugins.freezeExecute.authority} label="Freeze Execute" />
        </PluginSection>
      ) : null}

      {plugins.immutableMetadata ? (
        <PluginSection title="Immutable Metadata">
          <AuthorityStats authority={plugins.immutableMetadata.authority} label="Immutable Metadata" />
        </PluginSection>
      ) : null}

      {plugins.lifecycleHooks?.length ? (
        <PluginSection title="Lifecycle Hooks">
          <div className="grid gap-3">
            {plugins.lifecycleHooks.map((lifecycleHook, index) => (
              <div className="grid gap-3 rounded-lg border border-border/60 p-3" key={`lifecycle-hook-${index}`}>
                <AuthorityStats authority={lifecycleHook.authority} label="Plugin" />
                {lifecycleHook.dataAuthority ? (
                  <AuthorityStats authority={lifecycleHook.dataAuthority} label="Data" />
                ) : null}
                <MplCoreUiExplorerStat
                  copyValue={lifecycleHook.hookedProgram}
                  label="Hooked Program"
                  value={lifecycleHook.hookedProgram}
                />
                <LifecycleChecksBadges lifecycleChecks={lifecycleHook.lifecycleChecks} />
                <JsonBlock label="Extra Accounts" value={lifecycleHook.extraAccounts} />
                <JsonBlock label="Stored Data" value={lifecycleHook.data} />
              </div>
            ))}
          </div>
        </PluginSection>
      ) : null}

      {plugins.linkedAppDatas?.length ? (
        <PluginSection title="Linked App Data">
          <div className="grid gap-3">
            {plugins.linkedAppDatas.map((linkedAppData, index) => (
              <div className="grid gap-3 rounded-lg border border-border/60 p-3" key={`linked-app-data-${index}`}>
                <AuthorityStats authority={linkedAppData.authority} label="Plugin" />
                <AuthorityStats authority={linkedAppData.dataAuthority} label="Data" />
                <MplCoreUiExplorerStat label="Schema" value={String(linkedAppData.schema)} />
                <JsonBlock label="Stored Data" value={linkedAppData.data} />
              </div>
            ))}
          </div>
        </PluginSection>
      ) : null}

      {plugins.linkedLifecycleHooks?.length ? (
        <PluginSection title="Linked Lifecycle Hooks">
          <div className="grid gap-3">
            {plugins.linkedLifecycleHooks.map((linkedLifecycleHook, index) => (
              <div className="grid gap-3 rounded-lg border border-border/60 p-3" key={`linked-lifecycle-hook-${index}`}>
                <AuthorityStats authority={linkedLifecycleHook.authority} label="Plugin" />
                {linkedLifecycleHook.dataAuthority ? (
                  <AuthorityStats authority={linkedLifecycleHook.dataAuthority} label="Data" />
                ) : null}
                <MplCoreUiExplorerStat
                  copyValue={linkedLifecycleHook.hookedProgram}
                  label="Hooked Program"
                  value={linkedLifecycleHook.hookedProgram}
                />
                <LifecycleChecksBadges lifecycleChecks={linkedLifecycleHook.lifecycleChecks} />
                <JsonBlock label="Extra Accounts" value={linkedLifecycleHook.extraAccounts} />
                <JsonBlock label="Stored Data" value={linkedLifecycleHook.data} />
              </div>
            ))}
          </div>
        </PluginSection>
      ) : null}

      {type === 'collection' && plugins.masterEdition ? (
        <PluginSection title="Master Edition">
          <AuthorityStats authority={plugins.masterEdition.authority} label="Master Edition" />
          {plugins.masterEdition.name ? (
            <MplCoreUiExplorerStat label="Name" value={plugins.masterEdition.name} />
          ) : null}
          {plugins.masterEdition.maxSupply ? (
            <MplCoreUiExplorerStat label="Max Supply" value={plugins.masterEdition.maxSupply.toString()} />
          ) : null}
          {plugins.masterEdition.uri ? (
            <MplCoreUiExplorerStat
              copyValue={plugins.masterEdition.uri}
              href={plugins.masterEdition.uri}
              label="URI"
              value={plugins.masterEdition.uri}
            />
          ) : null}
        </PluginSection>
      ) : null}

      {plugins.oracles?.length ? (
        <PluginSection title="Oracles">
          <div className="grid gap-3">
            {plugins.oracles.map((oracle, index) => (
              <div className="grid gap-3 rounded-lg border border-border/60 p-3" key={`oracle-${index}`}>
                <AuthorityStats authority={oracle.authority} label="Plugin" />
                <MplCoreUiExplorerStat copyValue={oracle.baseAddress} label="Base Address" value={oracle.baseAddress} />
                <MplCoreUiExplorerStat
                  label="Results Offset"
                  value={
                    oracle.resultsOffset.type === 'Custom'
                      ? oracle.resultsOffset.offset.toString()
                      : oracle.resultsOffset.type
                  }
                />
                <LifecycleChecksBadges lifecycleChecks={oracle.lifecycleChecks} />
                <JsonBlock label="Base Address Config" value={oracle.baseAddressConfig} />
              </div>
            ))}
          </div>
        </PluginSection>
      ) : null}

      {plugins.permanentBurnDelegate ? (
        <PluginSection title="Permanent Burn Delegate">
          <AuthorityStats authority={plugins.permanentBurnDelegate.authority} label="Permanent Burn Delegate" />
        </PluginSection>
      ) : null}

      {plugins.permanentFreezeDelegate ? (
        <PluginSection title="Permanent Freeze Delegate">
          <MplCoreUiExplorerStat label="Frozen" value={plugins.permanentFreezeDelegate.frozen ? 'Yes' : 'No'} />
          <AuthorityStats authority={plugins.permanentFreezeDelegate.authority} label="Permanent Freeze Delegate" />
        </PluginSection>
      ) : null}

      {plugins.permanentFreezeExecute ? (
        <PluginSection title="Permanent Freeze Execute">
          <AuthorityStats authority={plugins.permanentFreezeExecute.authority} label="Permanent Freeze Execute" />
        </PluginSection>
      ) : null}

      {plugins.permanentTransferDelegate ? (
        <PluginSection title="Permanent Transfer Delegate">
          <AuthorityStats authority={plugins.permanentTransferDelegate.authority} label="Permanent Transfer Delegate" />
        </PluginSection>
      ) : null}

      {plugins.royalties ? (
        <PluginSection title="Royalties">
          <MplCoreUiExplorerStat label="Basis Points" value={plugins.royalties.basisPoints.toString()} />
          <MplCoreUiExplorerStat label="Percentage" value={`${plugins.royalties.basisPoints / 100}%`} />
          <AuthorityStats authority={plugins.royalties.authority} label="Royalties" />
          <div className="grid gap-3">
            {[...plugins.royalties.creators]
              .sort((left, right) => left.address.localeCompare(right.address))
              .map((creator) => (
                <div className="grid gap-3 rounded-lg border border-border/60 p-3" key={creator.address}>
                  <MplCoreUiExplorerStat copyValue={creator.address} label="Creator" value={creator.address} />
                  <MplCoreUiExplorerStat label="Share" value={`${creator.percentage}%`} />
                </div>
              ))}
          </div>
        </PluginSection>
      ) : null}

      {plugins.transferDelegate ? (
        <PluginSection title="Transfer Delegate">
          <AuthorityStats authority={plugins.transferDelegate.authority} label="Transfer Delegate" />
        </PluginSection>
      ) : null}

      {plugins.updateDelegate ? (
        <PluginSection title="Update Delegate">
          <AuthorityStats authority={plugins.updateDelegate.authority} label="Update Delegate" />
          {plugins.updateDelegate.additionalDelegates?.length ? (
            <div className="grid gap-3">
              {[...plugins.updateDelegate.additionalDelegates]
                .sort((left, right) => left.localeCompare(right))
                .map((delegate) => (
                  <MplCoreUiExplorerStat
                    copyValue={delegate}
                    key={delegate}
                    label="Additional Delegate"
                    value={delegate}
                  />
                ))}
            </div>
          ) : null}
        </PluginSection>
      ) : null}

      {plugins.verifiedCreators ? (
        <PluginSection title="Verified Creators">
          <AuthorityStats authority={plugins.verifiedCreators.authority} label="Verified Creators" />
          <div className="grid gap-3">
            {[...plugins.verifiedCreators.signatures]
              .sort((left, right) => left.address.localeCompare(right.address))
              .map((creator) => (
                <div className="grid gap-3 rounded-lg border border-border/60 p-3" key={creator.address}>
                  <MplCoreUiExplorerStat copyValue={creator.address} label="Creator" value={creator.address} />
                  <MplCoreUiExplorerStat label="Verified" value={creator.verified ? 'Yes' : 'No'} />
                </div>
              ))}
          </div>
        </PluginSection>
      ) : null}

      {!hasPluginData ? (
        <Empty className="border border-border/60 bg-muted/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PuzzleIcon />
            </EmptyMedia>
            <EmptyTitle>No additional plugins</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            This {type} does not currently expose any parsed plugin details beyond its frozen state.
          </EmptyContent>
        </Empty>
      ) : null}
    </div>
  )
}

function AuthorityStats({ authority, label }: { authority: PluginAuthority | UpdateAuthority; label: string }) {
  return (
    <div className="grid gap-3">
      <MplCoreUiExplorerStat label={`${label} Authority Type`} value={authority.type} />
      {authority.address ? (
        <MplCoreUiExplorerStat copyValue={authority.address} label={`${label} Authority`} value={authority.address} />
      ) : null}
    </div>
  )
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  if (value === undefined) {
    return null
  }

  return (
    <div className="grid gap-1">
      <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</div>
      <pre className="max-h-64 overflow-auto rounded-lg border border-border/60 bg-muted/10 p-3 text-[11px] leading-5 whitespace-pre-wrap">
        {JSON.stringify(value, (_, entry) => (typeof entry === 'bigint' ? entry.toString() : entry), 2)}
      </pre>
    </div>
  )
}

function LifecycleChecksBadges({ lifecycleChecks }: { lifecycleChecks?: Record<string, unknown[]> }) {
  if (!lifecycleChecks) {
    return null
  }

  const lifecycleEntries = Object.keys(lifecycleChecks).sort()
  if (lifecycleEntries.length === 0) {
    return null
  }

  return (
    <div className="grid gap-2">
      <div className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Lifecycle Checks</div>
      <div className="flex flex-wrap gap-2">
        {lifecycleEntries.map((entry) => (
          <Badge key={entry} variant="outline">
            {entry}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function PluginSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="space-y-3 rounded-lg border border-border/60 p-4">
      <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</div>
      {children}
    </div>
  )
}
