import {
  DefineWorkflow,
  Schema,
} from "https://deno.land/x/deno_slack_sdk@2.7.0/mod.ts";
import { StandupExcludeFunction } from "../functions/standup_exclude.ts";

export const ExcludeModalWorkflow = DefineWorkflow({
  callback_id: "exclude_modal_workflow",
  title: "Exclude User Modal Workflow",
  description: "Exclude users from standup with modal",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
      user_id: {
        type: Schema.slack.types.user_id,
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["channel_id", "user_id", "interactivity"],
  },
});

const formStep = ExcludeModalWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Exclude from Standup",
    submit_label: "Exclude",
    interactivity: ExcludeModalWorkflow.inputs.interactivity,
    fields: {
      elements: [
        {
          name: "users_to_exclude",
          title: "Users to exclude",
          type: Schema.types.array,
          items: {
            type: Schema.slack.types.user_id,
          },
          description: "Select one or more users to exclude from standup lists",
        },
      ],
      required: ["users_to_exclude"],
    },
  },
);

// Process each user
const excludeStep = ExcludeModalWorkflow.addStep(StandupExcludeFunction, {
  channel_id: ExcludeModalWorkflow.inputs.channel_id,
  user_input: formStep.outputs.fields.users_to_exclude,
  requesting_user: ExcludeModalWorkflow.inputs.user_id,
});

ExcludeModalWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: ExcludeModalWorkflow.inputs.channel_id,
  message: excludeStep.outputs.message,
});

export default ExcludeModalWorkflow;
