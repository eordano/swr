import {
  pagesResponseInterface,
  pageComponentType,
  pageOffsetMapperType
} from './types'
export declare function useSWRPages<OffsetType>(
  pageKey: string,
  pageFn: pageComponentType,
  swrDataToOffset: pageOffsetMapperType<OffsetType>,
  deps?: any[]
): pagesResponseInterface
