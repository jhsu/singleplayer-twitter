import { useStore } from "@/lib/store";
import React, { useState } from "react";

declare global {
	interface Window {
		Notification: Notification;
	}
}

const WebNotification = () => {
	const setNotification = useStore((state) => state.setNotifications);
	const [isChecked, setIsChecked] = useState(
		Notification.permission === "granted",
	);

	// Function to handle checkbox change and request for permissions
	const handleCheckboxChange = async () => {
		let permission = Notification.permission;

		if (!isChecked) {
			if (permission === "default") {
				permission = await Notification.requestPermission();
			}

			if (permission === "granted") {
				setNotification(true);
				// new Notification("Permission granted for web notifications.");
			} else if (permission === "denied") {
				setNotification(false);
				alert("Permission denied for web notifications.");
			}
		}
		setIsChecked((prev) => !prev);
	};

	if (!("Notification" in window)) {
		return <p>Sorry, your browser does not support Web Notifications.</p>;
	}

	return (
		<div>
			<label>
				<input
					type="checkbox"
					checked={isChecked}
					onChange={handleCheckboxChange}
				/>
				Enable web notifications
			</label>
		</div>
	);
};

export default WebNotification;
