export type IBaseConfig = {
    sitename?: string;
    author?: string;
    primaryColor?: number;
    cover?: string;
}

export type IMenuConfig = {
    menus?: Object[];
}

export type IConfig = {
    baseConfig: IBaseConfig;
}