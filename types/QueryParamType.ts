export type AttachType = 'PROFILE' | 'POST' | 'ALCOHOL';

export interface QueryParamType {
  type: AttachType;
  pk: string;
}
