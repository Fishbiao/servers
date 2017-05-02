/**
 * Created by kilua on 2015-06-26.
 */

var exp = module.exports = {};

// 状态码
exp.STATUS = {
    EXCEPTION: 1,
    SUCCESS: 2,
    FAILURE: 3      // 只有此状态，平台不扣用户钱
};

// 异常状态码
exp.CODE = {
    SIGN_ERROR: 'sign_error',
    USER_NOT_EXIST: 'user_not_exist',
    ORDERID_EXIST: 'orderid_exist',
    MONEY_ERROR: 'money_error',
    SERVER_NOT_EXIST: 'server_not_exist',
    OTHER_ERROR: 'other_error',
    INTERFACE_DISABLED: 'interface_disabled',
    NO_SUCH_PRODUCT: 'no_such_product',
    OPERATION_FLAG_MASK: 'operation_flag_mask'
};