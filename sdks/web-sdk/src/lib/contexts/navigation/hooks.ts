import { IAppConfiguration } from '../configuration';
import { steps } from './constants';
import { getFlowOrders } from '../flows/hooks';
import { Writable } from '../../../../node_modules/svelte/types/runtime/store/index';

const filterOutByType = (flowIds: string[], configuration: IAppConfiguration, type?: string) => {
  if (!type) return flowIds;
  return flowIds.filter(id => {
    const stepConfiguration = configuration.steps[id];
    const step = steps.find(s => s.name === stepConfiguration.name);
    return step?.type !== type;
  });
};

export const getNextStepId = (
  globalConfiguration: IAppConfiguration,
  currentStepId: string,
  skipType?: string,
) => {
  const stepsOrder = getFlowOrders(globalConfiguration) as string[];
  const filteredFlows = filterOutByType(stepsOrder, globalConfiguration, skipType);
  const currentFlowIndex = filteredFlows.findIndex(i => i === currentStepId);
  if (currentFlowIndex === filteredFlows.length) {
    throw Error("Next step doesn't exist");
  }
  return filteredFlows[currentFlowIndex + 1];
};

export const goToNextStep = (
  currentStepIdStore: Writable<string>,
  globalConfiguration: IAppConfiguration,
  currentStepId: string,
  skipType?: string,
) => {
  const nextStepId = getNextStepId(globalConfiguration, currentStepId, skipType);
  currentStepIdStore.set(nextStepId);
};

export const goToPrevStep = (
  currentStepIdStore: Writable<string>,
  globalConfiguration: IAppConfiguration,
  currentStepId: string,
  skipType?: string,
) => {
  const flows = getFlowOrders(globalConfiguration) as string[];
  const filteredFlows = filterOutByType(flows, globalConfiguration, skipType);
  const currentFlowIndex = filteredFlows.findIndex(i => i === currentStepId);
  if (currentFlowIndex === 0) {
    throw Error('Error moving step back, this is the first step');
  }
  currentStepIdStore.set(filteredFlows[currentFlowIndex - 1]);
};
