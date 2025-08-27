import {
  DefineFunction,
  Schema,
  SlackFunction,
} from "https://deno.land/x/deno_slack_sdk@2.7.0/mod.ts";
import { ExcludedUsersDatastore } from "../datastores/excluded_users.ts";

export const StandupExcludeFunction = DefineFunction({
  callback_id: "standup_exclude_function",
  title: "Exclude User from Standup",
  description: "Add users to the exclude list",
  source_file: "functions/standup_exclude.ts",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.types.string,
        description: "Channel ID",
      },
      user_input: {
        type: Schema.types.array,
        items: {
          type: Schema.slack.types.user_id,
        },
        description: "Users to exclude",
      },
      requesting_user: {
        type: Schema.types.string,
        description: "User making the request",
      },
    },
    required: ["channel_id", "user_input", "requesting_user"],
  },
  output_parameters: {
    properties: {
      message: {
        type: Schema.types.string,
        description: "Result message",
      },
    },
    required: ["message"],
  },
});

export default SlackFunction(
  StandupExcludeFunction,
  async ({ inputs, client }) => {
    const { channel_id, user_input, requesting_user } = inputs;

    // user_input is always an array now
    const usersToExclude: string[] = user_input || [];

    if (usersToExclude.length === 0) {
      return {
        outputs: {
          message: "No users selected to exclude.",
        },
      };
    }

    try {
      console.log(
        `Excluding ${usersToExclude.length} user(s) from channel: ${channel_id}`,
      );

      // Query existing excluded users
      const existingResponse = await client.apps.datastore.query<
        typeof ExcludedUsersDatastore.definition
      >({
        datastore: "excluded_users",
      });

      console.log(`Query response:`, existingResponse);

      const existingExcluded = new Set(
        existingResponse.items
          ?.filter((item) => item.channel_id === channel_id)
          ?.map((item) => item.user_id) || [],
      );

      const newExclusions: string[] = [];
      const alreadyExcluded: string[] = [];

      // Process each user
      for (const userId of usersToExclude) {
        if (existingExcluded.has(userId)) {
          alreadyExcluded.push(userId);
        } else {
          newExclusions.push(userId);

          // Add to datastore
          const id = `${channel_id}_${userId}`;
          await client.apps.datastore.put<
            typeof ExcludedUsersDatastore.definition
          >({
            datastore: "excluded_users",
            item: {
              id,
              channel_id,
              user_id: userId,
            },
          });
        }
      }

      // Get user mentions for the message
      const userNames: string[] = [];
      for (const userId of newExclusions) {
        userNames.push(`<@${userId}>`);
      }

      let message = "";

      if (newExclusions.length > 0) {
        message += `Excluded ${
          userNames.join(", ")
        } from standup lists in this channel.`;
      }

      if (alreadyExcluded.length > 0) {
        const alreadyNames: string[] = [];
        for (const userId of alreadyExcluded) {
          alreadyNames.push(`<@${userId}>`);
        }
        if (message) message += "\n";
        message += `Already excluded: ${alreadyNames.join(", ")}`;
      }

      return {
        outputs: {
          message: message || "No changes made.",
        },
      };
    } catch (error) {
      console.error(`Error in exclude function:`, error);
      return {
        outputs: {
          message: `Failed to exclude user(s). Error: ${
            error instanceof Error ? error.message : error
          }`,
        },
      };
    }
  },
);
