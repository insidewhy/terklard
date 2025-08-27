import {
  DefineWorkflow,
  Schema,
} from "https://deno.land/x/deno_slack_sdk@2.7.0/mod.ts";
import { StandupFunction } from "../functions/standup.ts";

export const StandupWorkflow = DefineWorkflow({
  callback_id: "standup_workflow",
  title: "Standup Workflow",
  description: "Run daily standup",
  input_parameters: {
    properties: {
      channel_id: {
        type: Schema.slack.types.channel_id,
      },
      user_id: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["channel_id", "user_id"],
  },
});

const standupStep = StandupWorkflow.addStep(StandupFunction, {
  channel_id: StandupWorkflow.inputs.channel_id,
});

StandupWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: StandupWorkflow.inputs.channel_id,
  message: standupStep.outputs.standup_list,
});

export default StandupWorkflow;
