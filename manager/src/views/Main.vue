<style lang="scss">
@import "./main.scss";
</style>
<template>
  <div class="main">
    <!-- 左侧菜单 -->
    <div class="sidebar-menu-con menu-bar">
      <div class="logo-con">
        <!-- <img src="../assets/logo.png" key="max-logo" /> -->
        <img :src="domainLogo" key="max-logo" />
      </div>
      <shrinkable-menu></shrinkable-menu>
    </div>
    <!-- 顶部标题栏主体 -->
    <div class="main-header-con" :style="{ height: setting.isUseTabsRouter ? '100px' : '60px' }">
      <div class="main-header">
        <div class="header-avator-con">
          <!-- 左侧栏 -->
          <div>

          </div>
          <div class="flex flex-a-c user-module">
            <!-- 通知消息 -->
            <message-tip v-if="tipsMessage" :res="tipsMessage"></message-tip>
            <!-- 用户头像 -->
            <div class="user-dropdown-menu-con">
              <Row
                type="flex"
                justify="end"
                align="middle"
                class="user-dropdown-innercon"
              >
                <ul class="nav-list">
                  <li class="nav-item " @click="handleClickSetting">
                    <Tooltip content="设置">
                      <Icon size="16" type="md-settings" />
                    </Tooltip>
                  </li>
                </ul>
                <Dropdown
                  transfer
                  trigger="hover"
                  @on-click="handleClickUserDropdown"
                >
                  <div class="dropList">
                    <span class="main-user-name">{{ userInfo.nickName }}</span>
                    <Avatar
                      icon="ios-person"
                      :src="avatarPath"
                      style="background: #fff; margin-left: 10px"
                    ></Avatar>
                  </div>
                  <DropdownMenu slot="list">
                    <DropdownItem name="personalCenter">{{
                      $t("userCenter")
                    }}</DropdownItem>
                    <DropdownItem name="changePass">{{
                      $t("changePass")
                    }}</DropdownItem>
                    <DropdownItem name="loginOut" divided>{{
                      $t("logout")
                    }}</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </Row>
            </div>
          </div>
        </div>
      </div>
      <!-- 已打开的页面标签 -->
      <div class="tags-con"  v-if="setting.isUseTabsRouter">
        <tags-page-opened :pageTagsList="pageTagsList"></tags-page-opened>
      </div>
    </div>
    <div class="single-page-con"  :style="{ 'top': setting.isUseTabsRouter ? '100px' : '60px', height: setting.isUseTabsRouter ? 'calc(100% - 110px)' : 'calc(100% - 70px)' }">
      <div class="single-page">
        <!-- <keep-alive :include="cachePage"> -->
        <router-view></router-view>
        <!-- </keep-alive> -->
      </div>
    </div>
    <!-- 全局加载动画 -->
    <circleLoading class="loading-position" v-show="loading" />
    <!-- 右侧抽屉配置 -->
    <configDrawer ref="config"/>
  </div>
</template>

<script>
import shrinkableMenu from "./main-parts/shrinkable-menu/shrinkable-menu.vue";
import tagsPageOpened from "./main-parts/tags-page-opened.vue";
import messageTip from "./main-parts/message-tip.vue";
import circleLoading from "@/components/lili/circle-loading.vue";
import configDrawer from "@/components/lili/config-drawer.vue";
import Cookies from "js-cookie";
import util from "@/libs/util.js";
import { getNoticePage, logout } from "@/api/index";
import { getBaseSite } from "@/api/common";

var client;
const config = require("@/config/index.js");
export default {
  components: {
    shrinkableMenu,
    tagsPageOpened,
    messageTip,
    circleLoading,
    configDrawer
  },
  data() {
    return {
      config,
      sliceNum: 5, // 展示nav数量
      userInfo: "", // 用户信息
      tipsMessage: "", // 通知消息
      domainLogo: "",
    };
  },
  computed: {
    setting(){
      let data = this.$store.state.setting

      return data.setting
    },
    loading() {
      return this.$store.state.app.loading;
    },
    pageTagsList() {
      return this.$store.state.app.pageOpenedList; // 打开的页面的页面对象
    },
    avatarPath() {
      return localStorage.avatorImgPath;
    },
    lang() {
      return this.$store.state.app.lang;
    },
  },

  methods: {
    handleClickSetting() {
      this.$refs.config.open();
    },
    init() {
      // 菜单初始化
      let userInfo = JSON.parse(Cookies.get("userInfoManager"));

      this.userInfo = userInfo;
      this.checkTag(this.$route.name);
      let currWidth = document.body.clientWidth;
      if (currWidth <= 1200) {
        this.sliceNum = 2;
      }
      this.domainLogo = localStorage.getItem("icon");
      let link =
        document.querySelector("link[rel*='icon']") ||
        document.createElement("link");
      link.type = "image/x-icon";
      link.href = localStorage.getItem("domainIcon");
      link.rel = "shortcut icon";
      document.getElementsByTagName("head")[0].appendChild(link);
      window.document.title = localStorage.getItem("title") + " - 运营后台";
      // 读取未读消息数
      getNoticePage({}).then((res) => {
        if (res.success) {
          this.tipsMessage = res.result;

          this.$store.state.notices = res.result;
        }
      });
    },

    //用户头像下方抽屉点击
    handleClickUserDropdown(name) {
      //个人中心
      if (name === "personalCenter") {
        util.openNewPage(this, "personal-center");
        this.$router.push({
          name: "personal-center",
        });
      }
      //修改密码
      else if (name === "changePass") {
        util.openNewPage(this, "change-password");
        this.$router.push({
          name: "change_password",
        });
      }
      // 退出登录
      else if (name === "loginOut") {
        logout().then((res) => {
          this.$store.commit("logout", this);
          this.$store.commit("setAdded", false);
          this.setStore("accessToken", "");
          this.setStore("refreshToken", "");
          this.$router.push({ path: "/login" });
        });
      }
    },
    //切换标签
    checkTag(name) {
      let openpageHasTag = this.pageTagsList.some((item) => {
        if (item.name == name) {
          return true;
        }
      });
      if (!openpageHasTag) {
        //  解决关闭当前标签后再点击回退按钮会退到当前页时没有标签的问题
        util.openNewPage(
          this,
          name,
          this.$route.params || {},
          this.$route.query || {}
        );
      }
    },
    //宽度动态计算
    resize() {
      let currWidth = document.body.clientWidth;
      let count = currWidth / 300;
      if (count > 6) {
        this.sliceNum = 6;
      } else {
        this.sliceNum = count;
      }
    },
  },
  watch: {
    $route(to, from) {
      this.checkTag(to.name);
      localStorage.currentPageName = to.name;
    },
  },
  mounted() {
    this.init();
    let that = this;
    this.resize();
    window.addEventListener("resize", function () {
      that.resize();
    });
  },
  created() {
    // 显示打开的页面的列表
    this.$store.commit("setOpenedList");
  },
};
</script>
