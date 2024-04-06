var BASE = {
    /**
     * @description api请求基础路径
     */
    API_DEV: {
      // common: "https://common-api.pickmall.cn",
      // buyer: "https://buyer-api.pickmall.cn",
      // seller: "https://store-api.pickmall.cn",
      // manager: "https://admin-api.pickmall.cn"
      common: "http://127.0.0.1:8890",
      buyer: "http://127.0.0.1:8888",
      manager: "http://127.0.0.1:8887"
    },
    API_PROD: {
      common: "http://101.126.5.141:8890",
      buyer: "http://101.126.5.141:8888",
      seller: "https://store-api.pickmall.cn",
      manager: "http://194.32.149.125:8887"
    },
    /**
     * @description // 跳转买家端地址 pc端
     */
    PC_URL: "https://pc-b2b2c.pickmall.cn",
    /**
     * @description  // 跳转买家端地址 wap端
     */
    WAP_URL: "https://m-b2b2c.pickmall.cn",
    /**
     *  @description api请求基础路径前缀
     */
    PREFIX: "/manager"
  };
