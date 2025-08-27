import { Trigger } from "https://deno.land/x/deno_slack_sdk@2.7.0/types.ts";
import { StandupWorkflow } from "../workflows/standup.ts";

const standupTrigger: Trigger<typeof StandupWorkflow.definition> = {
  type: "shortcut",
  name: "Standup",
  description: "List channel members in random order",
  workflow: `#/workflows/${StandupWorkflow.definition.callback_id}`,
  inputs: {
    channel_id: {
      value: "{{data.channel_id}}",
    },
    user_id: {
      value: "{{data.user_id}}",
    },
  },
};

export default standupTrigger;
