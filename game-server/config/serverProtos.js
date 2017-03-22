/**
 * Created by fisher on 2017/3/20.服务端之间数据传输。
 optional:表示是一个可选字段，可选对于发送方，在发送消息时，可以有选择性的设置或者不设置该字段的值。对于接收方，如果能够识别可选字段就进行相应的处理，如果无法识别，则忽略该字段，消息中的其它字段正常处理。
 
 repeated:表示该字段可以包含0~N个元素。其特性和optional一样，但是每一次可以包含多个值。可以看作是在传递一个数组的值。
 */

module.exports = {
    //"message Hero": {
    //    // 位置
    //    "optional uInt32 pos": 1,
    //    // 猎魔人id，策划表heroId
    //    "optional uInt32 heroId": 2,
    //    // 等级
    //    "optional byte curLevel": 3,
    //    // 经验
    //    "optional uInt32 curExperience": 4,
    //    // 品质
    //    "optional byte quality": 5,
    //    // 技能列表
    //    "repeated Skill skills": 6
    //},
};
