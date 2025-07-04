export const localImages: Record<string,  {
    src: string;
    width: number;
    height: number;
    format: string;
  }> = import.meta.glob('../content/attachment/*.{jpg,png,jpeg,webp}', {
    eager: true,
    import: 'default'
});