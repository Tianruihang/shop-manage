// 统一请求路径前缀在libs/axios.js中修改
import {
  getRequest,
  putRequest,
  postRequest,
  deleteRequest,
} from "@/libs/axios";

//列表
export const getAtmMingMachine = (params) => {
  return getRequest("/atmMingMachine/getByPage", params);
};

//详情
export const getAtmMingMachineInfo = (id) => {
  return getRequest(`/atmMingMachine/detail/${id}`);
};

//新增
export const insertAtmMingMachine = (params) => {
  return postRequest("/atmMingMachine/insert", params);
};

//修改
export const updateAtmMingMachine = (params) => {
  return putRequest("/atmMingMachine/update", params);
};
