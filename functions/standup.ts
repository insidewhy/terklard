import {
  DefineFunction,
  Schema,
  SlackFunction,
} from "https://deno.land/x/deno_slack_sdk@2.7.0/mod.ts";
import { ExcludedUsersDatastore } from "../datastores/excluded_users.ts";

export const StandupFunction = DefineFunction({
  callback_id: "standup_function",
  title: "Run Standup",
  description: "List channel members in random order",
  source_file: "functions/standup.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.types.string,
        description: "Channel to run standup in",
      },
    },
    required: ["channel_id"],
  },
  output_parameters: {
    properties: {
      standup_list: {
        type: Schema.types.string,
        description: "Randomized list of users",
      },
    },
    required: ["standup_list"],
  },
});

export default SlackFunction(
  StandupFunction,
  async ({ inputs, client }) => {
    const { channel_id } = inputs;

    try {
      const membersResponse = await client.conversations.members({
        channel: channel_id,
      });

      if (!membersResponse.ok) {
        return {
          error: `Failed to get channel members: ${membersResponse.error}`,
        };
      }

      const excludedResponse = await client.apps.datastore.query<
        typeof ExcludedUsersDatastore.definition
      >({
        datastore: "excluded_users",
      });

      // Filter for this channel
      const channelExcluded = excludedResponse.items?.filter(
        (item) => item.channel_id === channel_id,
      ) || [];

      const excludedSet = new Set(
        channelExcluded.map((item) => item.user_id),
      );

      const eligibleMembers = (membersResponse.members || [])
        .filter((userId: string) => !excludedSet.has(userId));

      const shuffled = [...eligibleMembers].sort(() => Math.random() - 0.5);

      const userInfoPromises = shuffled.map((userId: string) =>
        client.users.info({ user: userId })
      );
      const userResponses = await Promise.all(userInfoPromises);

      const userNames = userResponses.map((response, index) => {
        // Use Slack mention format <@USER_ID> for proper mentions
        return `<@${shuffled[index]}>`;
      });

      const standup_list = userNames.join("\n") ||
        "No users found in this channel.";

      return { outputs: { standup_list } };
    } catch (error) {
      console.error(`Error in standup function:`, error);
      return {
        outputs: {
          standup_list: `Failed to generate standup list. Error: ${
            error instanceof Error ? error.message : error
          }`,
        },
      };
    }
  },
);
