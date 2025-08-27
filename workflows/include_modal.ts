import {
  DefineWorkflow,
  Schema,
} from "https://deno.land/x/deno_slack_sdk@2.7.0/mod.ts";
import { StandupIncludeFunction } from "../functions/standup_include.ts";

export const IncludeModalWorkflow = DefineWorkflow({
  callback_id: "include_modal_workflow",
  title: "Include User Modal Workflow",
  description: "Include users in standup with modal",
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

const formStep = IncludeModalWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Include in Standup",
    submit_label: "Include",
    interactivity: IncludeModalWorkflow.inputs.interactivity,
    fields: {
      elements: [
        {
          name: "users_to_include",
          title: "Users to include",
          type: Schema.types.array,
          items: {
            type: Schema.slack.types.user_id,
          },
          description:
            "Select one or more users to include back in standup lists",
        },
      ],
      required: ["users_to_include"],
    },
  },
);

const includeStep = IncludeModalWorkflow.addStep(StandupIncludeFunction, {
  channel_id: IncludeModalWorkflow.inputs.channel_id,
  user_input: formStep.outputs.fields.users_to_include,
  requesting_user: IncludeModalWorkflow.inputs.user_id,
});

IncludeModalWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: IncludeModalWorkflow.inputs.channel_id,
  message: includeStep.outputs.message,
});

export default IncludeModalWorkflow;
