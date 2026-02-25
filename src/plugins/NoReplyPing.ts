import { definePlugin } from "#plugin";

export default definePlugin({
	name: "NoReplyPing",
	description: "Disable ping on reply by default.",
	patches: [{
		// components/channel/MessageActionUtils.tsx
		find: ',message:"Embeds suppressed"}',
		replace: [{
			pattern: /let (?<shouldMention>\i)=null!=\(\i=null==\i\?void 0:\i\.mention\).{0,50}?;/,
			replacement: "$&$<shouldMention>=!$<shouldMention>;",
		}]
	}]
});
