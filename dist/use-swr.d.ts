import {
  keyInterface,
  ConfigInterface,
  triggerInterface,
  mutateInterface,
  responseInterface
} from './types'
declare const trigger: triggerInterface
declare const mutate: mutateInterface
declare function useSWR<Data = any, Error = any>(
  key: keyInterface
): responseInterface<Data, Error>
declare function useSWR<Data = any, Error = any>(
  key: keyInterface,
  config?: ConfigInterface<Data, Error>
): responseInterface<Data, Error>
declare function useSWR<Data = any, Error = any>(
  key: keyInterface,
  fn?: Function,
  config?: ConfigInterface<Data, Error>
): responseInterface<Data, Error>
declare const SWRConfig: import('react').ProviderExoticComponent<
  import('react').ProviderProps<ConfigInterface<any, any>>
>
export { trigger, mutate, SWRConfig }
export default useSWR
