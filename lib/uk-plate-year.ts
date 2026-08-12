export type PlateYearOption = { year: number; label: string };

const FIRST_YEAR = 2001;

// UK DVLA age-identifier scheme: March-August uses the plain two-digit
// year; September-February uses year+50 (e.g. Sept 2003 -> "53").
// The numeric format only exists from September 2001 onward — March to
// August 2001 still used the old letter-suffix system, so there's no
// "01-plate".
export function getPlateYearOptions(
  currentYear: number = new Date().getFullYear()
): PlateYearOption[] {
  const options: PlateYearOption[] = [];

  for (let year = currentYear; year >= FIRST_YEAR; year--) {
    const septIdentifier = String((year % 100) + 50).padStart(2, "0");
    options.push({ year, label: `${septIdentifier}-plate (${year})` });

    if (year > FIRST_YEAR) {
      const marchIdentifier = String(year % 100).padStart(2, "0");
      options.push({ year, label: `${marchIdentifier}-plate (${year})` });
    }
  }

  return options;
}
