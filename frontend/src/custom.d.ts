// remove typescript errors when importing svg files in *.tsx
declare module "*.svg" {
    const content: any;
    export default content;
  }

// remove typescript errors when importing png files in *.tsx
declare module "*.png" {
    const content: any;
    export default content;
  }