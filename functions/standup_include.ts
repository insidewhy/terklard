import {
  DefineFunction,
  Schema,
  SlackFunction,
} from "https://deno.land/x/deno_slack_sdk@2.7.0/mod.ts";
import { ExcludedUsersDatastore } from "../datastores/excluded_users.ts";

export const StandupIncludeFunction = DefineFunction({
  callback_id: "standup_include_function",
  title: "Include User in Standup",
  description: "Remove users from the exclude list",
  source_file: "functions/standup_include.ts",
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
        description: "Users to include",
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
  StandupIncludeFunction,
  async ({ inputs, client }) => {
    const { channel_id, user_input, requesting_user } = inputs;

    // user_input is always an array now
    const usersToInclude: string[] = user_input || [];

    if (usersToInclude.length === 0) {
      return {
        outputs: {
          message: "No users selected to include.",
        },
      };
    }

    try {
      console.log(
        `Including ${usersToInclude.length} user(s) in channel: ${channel_id}`,
      );

      // Query existing excluded users
      const existingResponse = await client.apps.datastore.query<
        typeof ExcludedUsersDatastore.definition
      >({
        datastore: "excluded_users",
      });

      const excludedItems = existingResponse.items?.filter(
        (item) => item.channel_id === channel_id,
      ) || [];

      const reincluded: string[] = [];
      const notExcluded: string[] = [];

      // Process each user
      for (const userId of usersToInclude) {
        const itemToDelete = excludedItems.find((item) =>
          item.user_id === userId
        );

        if (itemToDelete) {
          await client.apps.datastore.delete<
            typeof ExcludedUsersDatastore.definition
          >({
            datastore: "excluded_users",
            id: itemToDelete.id,
          });
          reincluded.push(userId);
        } else {
          notExcluded.push(userId);
        }
      }

      // Get user mentions for the message
      const reincludedNames: string[] = [];
      for (const userId of reincluded) {
        reincludedNames.push(`<@${userId}>`);
      }

      let message = "";

      if (reincluded.length > 0) {
        message += `Included ${
          reincludedNames.join(", ")
        } back in standup lists for this channel.`;
      }

      if (notExcluded.length > 0) {
        const notExcludedNames: string[] = [];
        for (const userId of notExcluded) {
          notExcludedNames.push(`<@${userId}>`);
        }
        if (message) message += "\n";
        message += `Not previously excluded: ${notExcludedNames.join(", ")}`;
      }

      return {
        outputs: {
          message: message || "No changes made.",
        },
      };
    } catch (error) {
      console.error(`Error in include function:`, error);
      return {
        outputs: {
          message: `Failed to include user(s). Error: ${
            error instanceof Error ? error.message : error
          }`,
        },
      };
    }
  },
);
