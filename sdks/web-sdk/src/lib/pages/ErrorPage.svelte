<script lang="ts">
  import { T } from '../contexts/translation';
  import { onDestroy } from 'svelte';
  import { Image, Button, Title, IconCloseButton } from '../atoms';
  import { configuration } from '../contexts/configuration';
  import { appState, currentParams } from '../contexts/app-state';
  import { Elements } from '../contexts/configuration/types';
  import ErrorText from '../atoms/ErrorText/ErrorText.svelte';
  import {
    EActionNames,
    sendButtonClickEvent,
    sendFlowCompleteEvent,
    EVerificationStatuses,
  } from '../utils/event-service';
  import { flowError } from '../services/analytics';
  import { DecisionStatus } from '../contexts/app-state/types';
  import { getLayoutStyles, getStepConfiguration, uiPack } from '../ui-packs';
  import { getFlowConfig } from '../contexts/flows/hooks';

  export let stepId;

  const step = getStepConfiguration($configuration, $uiPack, stepId);
  const flow = getFlowConfig($configuration);
  const style = getLayoutStyles($configuration, $uiPack, step);

  const stepNamespace = step.namespace!;
  const message = $currentParams ? $currentParams.message : '';

  const handleClose = () => {
    sendFlowCompleteEvent({
      status: EVerificationStatuses.ERROR,
      idvResult: DecisionStatus.DECLINED,
    });
  };

  flowError();

  onDestroy(() => {
    $currentParams = null;
  });
</script>

<div class="container" {style}>
  {#each step.elements as element}
    {#if element.type === Elements.Image}
      <Image configuration={element.props} />
    {/if}
    {#if element.type === Elements.IconCloseButton && flow.showCloseButton}
      <IconCloseButton
        configuration={element.props}
        on:click={() => {
          sendButtonClickEvent(
            EActionNames.CLOSE,
            { status: EVerificationStatuses.DATA_COLLECTION },
            $appState,
            true,
          );
        }}
      />
    {/if}
    {#if element.type === Elements.Title}
      <Title configuration={element.props}>
        <T key="title" namespace={stepNamespace} />
      </Title>
    {/if}
    {#if element.type === Elements.ErrorText}
      <ErrorText configuration={element.props}>
        {#if message}
          {message}
        {:else}
          <T key="description" namespace={stepNamespace} />
        {/if}
      </ErrorText>
    {/if}
    {#if element.type === Elements.Button}
      <Button configuration={element.props} on:click={handleClose}>
        <T key="button" namespace={stepNamespace} />
      </Button>
    {/if}
  {/each}
</div>

<style>
  .container {
    padding: var(--padding);
    position: relative;
    background: var(--background);
    text-align: center;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
