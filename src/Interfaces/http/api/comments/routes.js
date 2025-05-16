const { options } = require("@hapi/hapi/lib/cors");

const rouutes = (handler) => [
  {
    method: "POST",
    path: "/threads/{threadId}/comments",
    handler: (request, h) => handler.postCommentHandler(request, h),
    options: {
      auth: "forumapi_jwt",
    },
  },
];

module.exports = rouutes;
