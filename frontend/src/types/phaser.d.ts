declare namespace Phaser {
  const AUTO: any;

  class Game {
    constructor(config?: any);
    [key: string]: any;
  }

  class Scene {
    constructor(...args: any[]);
    [key: string]: any;
  }

  namespace GameObjects {
    class Arc {
      [key: string]: any;
    }
    class Text {
      [key: string]: any;
    }
    class Sprite {
      [key: string]: any;
    }
    class Graphics {
      [key: string]: any;
    }
    class Rectangle {
      [key: string]: any;
    }
    class Container {
      [key: string]: any;
    }
    class Image {
      [key: string]: any;
    }
    class Line {
      [key: string]: any;
    }
  }

  namespace Math {
    function Between(min: any, max: any): any;
    class Vector2 {
      constructor(x?: any, y?: any);
      [key: string]: any;
    }
    function RadToDeg(value: any): any;
    namespace Angle {
      function Between(x1: any, y1: any, x2: any, y2: any): any;
    }
  }

  namespace Curves {
    class QuadraticBezier {
      constructor(v0: any, v1: any, v2: any);
      [key: string]: any;
    }
  }

  namespace Tweens {
    type Tween = any;
  }

  namespace Types {
    namespace Core {
      type GameConfig = any;
    }
  }

  namespace Scale {
    const FIT: any;
    const CENTER_BOTH: any;
  }
}

declare module 'phaser' {
  export = Phaser;
}
