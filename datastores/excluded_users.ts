import {
  DefineDatastore,
  Schema,
} from "https://deno.land/x/deno_slack_sdk@2.7.0/mod.ts";

export const ExcludedUsersDatastore = DefineDatastore({
  name: "excluded_users",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    channel_id: {
      type: Schema.types.string,
    },
    user_id: {
      type: Schema.types.string,
    },
  },
});
