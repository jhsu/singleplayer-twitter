import * as React from "react";
import Link from "next/link";

import { NavItem } from "@/types/nav";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WebNotification from "./notifications";

interface MainNavProps {
	items?: NavItem[];
}

export function MainNav({ items }: MainNavProps) {
	return (
		<div className="flex gap-6 md:gap-10">
			<Link href="/" className="flex items-center space-x-2 md:flex">
				<Icons.logo className="h-6 w-6" />
				<span className="font-bold sm:inline-block">{siteConfig.name}</span>
			</Link>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="-ml-4 hidden text-base hover:bg-transparent focus:ring-0"
					>
						<Icons.logo className="mr-2 h-4 w-4" />{" "}
						<span className="font-bold">Menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					sideOffset={24}
					className="w-[300px] overflow-scroll"
				>
					<DropdownMenuLabel>
						<Link href="/" className="flex items-center">
							<Icons.logo className="mr-2 h-4 w-4" /> {siteConfig.name}
						</Link>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{items?.map(
						(item, index) =>
							item.href && (
								<DropdownMenuItem key={index} asChild>
									<Link href={item.href}>{item.title}</Link>
								</DropdownMenuItem>
							),
					)}
				</DropdownMenuContent>
			</DropdownMenu>
			<WebNotification />
		</div>
	);
}
