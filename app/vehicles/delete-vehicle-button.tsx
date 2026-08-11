"use client";

export function DeleteVehicleButton() {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!confirm("Delete this vehicle? This can't be undone.")) {
          event.preventDefault();
        }
      }}
      className="text-sm font-medium text-red-600 underline"
    >
      Delete vehicle
    </button>
  );
}
