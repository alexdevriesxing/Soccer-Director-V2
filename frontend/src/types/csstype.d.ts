declare module 'csstype' {
  export interface Properties<TLength = string | number> {
    [property: string]: any;
    position?: any;
    flexDirection?: any;
    textAlign?: any;
  }
}
