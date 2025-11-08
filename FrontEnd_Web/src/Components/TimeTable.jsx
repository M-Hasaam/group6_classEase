import React, { useState, useEffect } from "react";

function StepSelection({ label, value, options, onChange }) {
  return (
    <div className="flex flex-col items-center w-full">
      <label className="font-semibold text-blue-300 mb-2 text-base md:text-lg">
        {label}
      </label>

      <div className="flex flex-wrap justify-center gap-4">
        {options.map((opt) => {
          const isBatchYear = label === "Batch Year";
          const isSelected = isBatchYear ? value.endsWith(opt) : value === opt;
 
          return (
            <label key={opt} className="cursor-pointer">
              <input
                type="radio"
                name={label}
                value={opt}
                checked={isSelected}
                onChange={() => onChange(opt)}
                className="peer hidden"
              />
              <span
                className={`block px-4 py-1 rounded-lg font-medium transition ${
                  isSelected
                    ? isBatchYear
                      ? "bg-gray-500 text-gray-900"
                      : "bg-gray-500 text-gray-900"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {opt}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function FormSection({
  program,
  setProgram,
  department,
  setDepartment,
  batchYear,
  setBatchYear,
  section,
  setSection,
  isLoading,
  getPrograms,
  getDepartments,
  getBatchYears,
  getSections,
}) {
  const cleanOptions = (options) => {
    const cleaned = new Set();

    options.forEach((opt) => {
      if (!opt || opt.toLowerCase() === "null") return;

      if (opt.includes("/")) {
        opt.split("/").forEach((sub) => cleaned.add(sub.trim()));
      } else {
        cleaned.add(opt.trim());
      }
    });

    return [...cleaned];
  };

  const programOptions = cleanOptions(getPrograms());
  const departmentOptions = program ? cleanOptions(getDepartments()) : [];

  const batchOptions = department
    ? cleanOptions(getBatchYears()).map((y) => ({
        value: y,
        label: y.startsWith("20") ? y.slice(2) : y,
      }))
    : [];

  const sectionOptions = batchYear ? cleanOptions(getSections()) : [];

  useEffect(() => {
    const rawDept = getDepartments();
    if (
      program &&
      rawDept.length > 0 &&
      rawDept.every((o) => o.toLowerCase() === "null")
    ) {
      setDepartment("null");
    }
  }, [program]);

  useEffect(() => {
    const rawBatch = getBatchYears();
    if (
      department &&
      rawBatch.length > 0 &&
      rawBatch.every((o) => o.toLowerCase() === "null")
    ) {
      setBatchYear("null");
    }
  }, [department]);

  useEffect(() => {
    const rawSec = getSections();
    if (
      batchYear &&
      rawSec.length > 0 &&
      rawSec.every((o) => o.toLowerCase() === "null")
    ) {
      setSection("null");
    }
  }, [batchYear]);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-600 p-8 mb-8 shadow-2xl">
      <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
        Select Your Schedule
      </h2>

      <div className="flex flex-col gap-y-6 justify-center items-center">
        <StepSelection
          label="Program"
          value={program}
          options={programOptions}
          onChange={setProgram}
        />

        {program && departmentOptions.length > 0 && (
          <StepSelection
            label="Department"
            value={department}
            options={departmentOptions}
            onChange={setDepartment}
          />
        )}

        {program && department && batchOptions.length > 0 && (
          <StepSelection
            label="Batch Year"
            value={batchYear}
            options={batchOptions.map((o) => o.label)}
            onChange={(selectedLabel) => {
              const match = batchOptions.find((o) => o.label === selectedLabel);
              if (match) setBatchYear(match.value);
            }}
          />
        )}

        {program && department && batchYear && sectionOptions.length > 0 && (
          <StepSelection
            label="Section"
            value={section}
            options={sectionOptions}
            onChange={setSection}
          />
        )}
      </div>
    </div>
  );
}

function TimetableSection({ isLoading, renderTimetable, day, setDay }) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Whole Week",
  ];

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl shadow-2xl border border-slate-600 overflow-hidden">
      <div className="flex justify-center items-center p-6 border-b border-slate-700 bg-slate-800">
        <label className="font-semibold text-blue-300 mr-3">View Day:</label>
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="p-3 rounded-lg bg-slate-700 text-white border border-slate-600 hover:border-blue-400 transition-all duration-200"
        >
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-slate-300 text-xl">Loading timetable data...</p>
        </div>
      ) : (
        renderTimetable()
      )}
    </div>
  );
}

const FASTTimetable = () => {
  const [timetableData, setTimetableData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [program, setProgram] = useState("");
  const [department, setDepartment] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [section, setSection] = useState("");
  const [day, setDay] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadTimetableData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("DB/TimeTable.json?v=" + Date.now());
      const data = await response.json();
      setTimetableData(data);

      const localTime = data?.Update?.local_time_pkt || "";

      const formatDateTime = (datetimeStr) => {
        const parts = datetimeStr.split(" ");
        const datePart = parts[0];
        const timePart = parts[1] || "";
        const ampm = parts[2] || "";

        const [year, month, day] = datePart.split("-").map(Number);
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const formattedDate = `${day}-${months[month - 1]}-${year}`;

        let formattedTime = "";
        if (timePart) {
          const [hh, mm] = timePart.split(":");
          formattedTime = `${hh}:${mm} ${ampm}`;
        }

        return `${formattedDate}${formattedTime ? " " + formattedTime : ""}`;
      };

      const formatted = formatDateTime(localTime);
      setLastUpdated(formatted);
    } catch (error) {
      console.error("Error loading timetable data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultDay = () => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let today = days[new Date().getDay()];
    if (today === "Saturday" || today === "Sunday") today = "Monday";
    setDay(today);
  };

  useEffect(() => {
    loadTimetableData();
    setDefaultDay();
  }, []);

  const getPrograms = () =>
    Object.keys(timetableData).filter(
      (k) => !["Update", "Other", "PHD"].includes(k)
    );

  const getDepartments = () =>
    program && timetableData[program]
      ? Object.keys(timetableData[program])
      : [];

  const getBatchYears = () =>
    program && department
      ? Object.keys(timetableData[program][department] || {})
      : [];

  const getSections = () =>
    program && department && batchYear
      ? Object.keys(timetableData[program][department][batchYear] || {}).filter(
          (sec) => sec !== "Subsections"
        )
      : [];

  const getDayData = (selectedDay) => {
    const sectionData =
      timetableData[program]?.[department]?.[batchYear]?.[section] || {};
    const nullSection =
      timetableData[program]?.[department]?.[batchYear]?.["null"] || {};

    const dedupeSlots = (slotsArray) => {
      const seenClassKeys = new Set();
      const result = [];

      for (const slot of slotsArray) {
        const timeKey = `${slot.time.start.value}-${slot.time.end.value}`;
        const newClasses = [];

        for (const cls of slot.classes || []) {
          const key = `${timeKey}||${cls.name}||${cls.location}||${cls.type}`;
          if (!seenClassKeys.has(key)) {
            seenClassKeys.add(key);
            newClasses.push(cls);
          }
        }

        if (newClasses.length > 0) {
          result.push({
            ...slot,
            classes: newClasses,
          });
        }
      }

      return result;
    };

    const mainRaw = [
      ...(sectionData[selectedDay] || []),
      ...(nullSection[selectedDay] || []),
    ];
    const mainUnique = dedupeSlots(mainRaw);

    const subsectionsRaw = sectionData.Subsections || {};
    const subsectionsUnique = {};

    for (const [subName, subObj] of Object.entries(subsectionsRaw)) {
      const subDayArr = subObj[selectedDay] || [];
      if (!subDayArr || subDayArr.length === 0) continue;

      const deduped = (() => {
        const seen = new Set();
        const res = [];
        for (const slot of subDayArr) {
          const timeKey = `${slot.time.start.value}-${slot.time.end.value}`;
          const newClasses = [];
          for (const cls of slot.classes || []) {
            const key = `${timeKey}||${cls.name}||${cls.location}||${cls.type}`;
            if (!seen.has(key)) {
              seen.add(key);
              newClasses.push(cls);
            }
          }
          if (newClasses.length > 0) {
            res.push({ ...slot, classes: newClasses });
          }
        }
        return res;
      })();

      if (deduped.length > 0) subsectionsUnique[subName] = deduped;
    }

    return {
      main: mainUnique,
      subsections: subsectionsUnique,
    };
  };

  const renderTimetable = () => {
    if (!program || !department || !batchYear || !section)
      return (
        <div className="p-10 text-center text-slate-400">
          Please select all fields to view timetable.
        </div>
      );

    const renderDayBlock = (d) => {
      const { main: mainSlots, subsections } = getDayData(d);
      const hasMain = mainSlots && mainSlots.length > 0;
      const hasSubs = subsections && Object.keys(subsections).length > 0;
      if (!hasMain && !hasSubs) return null;

      const sortedMain = [...(mainSlots || [])].sort(
        (a, b) => a.time.start.value - b.time.start.value
      );

      return (
        <div key={d} className="mb-8">
          <h3 className="text-xl font-semibold text-blue-300 mb-4 border-b border-slate-600 pb-2">
            {d}
          </h3>

          {sortedMain.length > 0 && (
            <div className="space-y-4 mb-4">
              {sortedMain.map((slot, i) => (
                <div
                  key={`main-${i}`}
                  className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:bg-slate-700 transition"
                >
                  <div className="text-blue-300 font-semibold">
                    {slot.time.start.text} {slot.time.start.AM_PM} -{" "}
                    {slot.time.end.text} {slot.time.end.AM_PM}
                  </div>
                  {slot.classes.map((cls, idx) => (
                    <div key={idx} className="mt-2 text-slate-200">
                      <div className="font-bold">{cls.name}</div>
                      <div className="text-sm">Venue: {cls.location}</div>
                      <div className="text-xs mt-1 text-slate-400">
                        {cls.type}
                      </div>
                      {cls.info && cls.info.length > 0 && (
                        <div className="mt-1 text-xs text-yellow-300">
                          {cls.info.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {hasSubs &&
            Object.entries(subsections).map(([subName, subSlots]) => {
              const sortedSub = [...subSlots].sort(
                (a, b) => a.time.start.value - b.time.start.value
              );
              if (sortedSub.length === 0) return null;
              return (
                <div key={`sub-${subName}`} className="mb-6">
                  <div className="bg-slate-700 px-4 py-2 rounded-lg mb-2">
                    <h4 className="text-blue-300 font-semibold">
                      Subsection {subName}
                    </h4>
                  </div>
                  <div className="space-y-4">
                    {sortedSub.map((slot, i) => (
                      <div
                        key={`sub-${subName}-${i}`}
                        className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:bg-slate-700 transition"
                      >
                        <div className="text-blue-300 font-semibold">
                          {slot.time.start.text} {slot.time.start.AM_PM} -{" "}
                          {slot.time.end.text} {slot.time.end.AM_PM}
                        </div>
                        {slot.classes.map((cls, idx) => (
                          <div key={idx} className="mt-2 text-slate-200">
                            <div className="font-bold">{cls.name}</div>
                            <div className="text-sm">Venue: {cls.location}</div>
                            <div className="text-xs mt-1 text-slate-400">
                              {cls.type}
                            </div>
                            {cls.info && cls.info.length > 0 && (
                              <div className="mt-1 text-xs text-yellow-300">
                                {cls.info.join(", ")}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      );
    };

    if (day === "Whole Week") {
      const daysOrder = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ];
      const weekBlocks = daysOrder
        .map((d) => renderDayBlock(d))
        .filter(Boolean);
      if (weekBlocks.length === 0) {
        return (
          <div className="p-10 text-center text-slate-400">
            No classes scheduled for selected week.
          </div>
        );
      }
      return <div className="p-6">{weekBlocks}</div>;
    }

    const singleBlock = renderDayBlock(day);
    if (!singleBlock) {
      return (
        <div className="p-10 text-center text-slate-400">
          No classes scheduled for <b>{day}</b>
        </div>
      );
    }

    return <div className="p-6">{singleBlock}</div>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white flex flex-col">
      <nav className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-center text-lg font-semibold">
        FAST Timetable App
      </nav>

      <div className="flex-1 w-full max-w-5xl mx-auto mt-8 px-6">
        <FormSection
          program={program}
          setProgram={setProgram}
          department={department}
          setDepartment={setDepartment}
          batchYear={batchYear}
          setBatchYear={setBatchYear}
          section={section}
          setSection={setSection}
          isLoading={isLoading}
          getPrograms={getPrograms}
          getDepartments={getDepartments}
          getBatchYears={getBatchYears}
          getSections={getSections}
        />

        {section && (
          <TimetableSection
            isLoading={isLoading}
            renderTimetable={renderTimetable}
            day={day}
            setDay={setDay}
          />
        )}

        {lastUpdated && (
          <div className="text-center text-sm text-slate-400 mt-6">
            Last updated: <span className="text-blue-400">{lastUpdated}</span>
          </div>
        )}
      </div>

      <footer className="bg-slate-800 mt-7 text-center py-4 text-sm">
        Only for Islamabad Campus
      </footer>
    </div>
  );
};

export default FASTTimetable;
