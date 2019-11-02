export interface ConfigInterface<Data = any, Error = any> {
  errorRetryInterval?: number
  loadingTimeout?: number
  focusThrottleInterval?: number
  dedupingInterval?: number
  refreshInterval?: number
  refreshWhenHidden?: boolean
  revalidateOnFocus?: boolean
  shouldRetryOnError?: boolean
  fetcher?: any
  suspense?: boolean
  onLoadingSlow?: (key: string, config: ConfigInterface<Data, Error>) => void
  onSuccess?: (
    data: Data,
    key: string,
    config: ConfigInterface<Data, Error>
  ) => void
  onError?: (
    err: Error,
    key: string,
    config: ConfigInterface<Data, Error>
  ) => void
  onErrorRetry?: (
    err: Error,
    key: string,
    config: ConfigInterface<Data, Error>,
    revalidate: revalidateType,
    revalidateOpts: RevalidateOptionInterface
  ) => void
}
export interface RevalidateOptionInterface {
  retryCount?: number
  noDedupe?: boolean
}
declare type keyFunction = () => string
export declare type keyInterface = string | keyFunction
export declare type updaterInterface = (
  shouldRevalidate?: boolean
) => boolean | Promise<boolean>
export declare type triggerInterface = (
  key: string,
  shouldRevalidate?: boolean
) => void
export declare type mutateInterface = (
  key: string,
  data: any,
  shouldRevalidate?: boolean
) => void
export declare type responseInterface<Data, Error> = {
  data?: Data
  error?: Error
  revalidate: () => Promise<boolean>
  isValidating: boolean
}
export declare type revalidateType = (
  revalidateOpts: RevalidateOptionInterface
) => Promise<boolean>
export declare type pagesWithSWRType = () => void
export declare type pagesPropsInterface<Offset> = {
  offset: Offset
  withSWR: pagesWithSWRType
}
export declare type pageComponentType = (props: pagesPropsInterface<any>) => any
export declare type pageOffsetMapperType<Offset> = (data: any) => Offset
export declare type pagesResponseInterface = {
  pages: any
  pageCount: number
  pageSWRs: responseInterface<any, any>[]
  isLoadingMore: boolean
  isReachingEnd: boolean
  isEmpty: boolean
  loadMore: () => void
}
export {}
