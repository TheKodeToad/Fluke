import { lazyProxy } from "#lazy";
import { definePlugin } from "#plugin";
import { wpRequire } from "#webpack";
import { CSSProperties, ReactNode } from "react";

const headerStyles = lazyProxy(() => {
	const styles = wpRequire("./src/components/bottomsheets/GuildHeaderBottomSheet.module.css");
	const findClassName = (name: string) => Object.values<string>(styles).find(x => x.includes("__" + name + "__"));

	return {
		stats: findClassName("stats"),
		stat: findClassName("stat"),
		statDot: findClassName("statDot"),
		statDotOnline: findClassName("statDotOnline"),
		statDotMembers: findClassName("statDotMembers"),
		statText: findClassName("statText"),
	};
});
const GuildMemberStore = lazyProxy(() => wpRequire("./src/stores/GuildMemberStore.tsx").A);
const PresenceStore = lazyProxy(() => wpRequire("./src/stores/PresenceStore.tsx").A);

function LabelWrapper({ children, guild, guildNameDefault }: { children: ReactNode, guild: any, guildNameDefault: string }) {
	const presenceCount = PresenceStore.getPresenceCount(guild.id);
	const memberCount = GuildMemberStore.getMemberCount(guild.id);
	const textStyle: CSSProperties = { fontSize: "0.875rem" };

	return (
		<div className="fluke-MemberCount-LabelWrapper" style={{ display: "flex", flexDirection: "column" }}>
			{children}
			<div className={headerStyles.stats}>
				<div className={headerStyles.stat}>
					<div className={`${headerStyles.statDot} ${headerStyles.statDotOnline}`} />
					<span className={guildNameDefault} style={textStyle}>{`${presenceCount} Online`}</span>
				</div>
				<div className={headerStyles.stat}>
					<div className={`${headerStyles.statDot} ${headerStyles.statDotMembers}`} />
					<span className={guildNameDefault} style={textStyle}>
						{memberCount === 1 ? `${memberCount} Member` : `${memberCount} Members`}
					</span>
				</div>
			</div>
		</div>
	);

}

export default definePlugin({
	name: "MemberCount",
	description: "Show community member count underneath the name.",
	patches: [{
		// stores/PresenceStore.tsx
		find: '"guild-header"in',
		replace: [{
			pattern: /\(0,\i.jsx\)\("span",\{className:(?<className>\i\?\i\.\i:\i\.\i),children:(?<guild>\i)\.name\}\)/,
			replacement: "$this.wrapLabel($&, $<guild>, $<className>)"
		}]
	}],
	wrapLabel(children: ReactNode, guild: any, guildNameDefault: string) {
		return <LabelWrapper children={children} guild={guild} guildNameDefault={guildNameDefault} />;
	}
});
