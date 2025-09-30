import React, { useState } from "react";
export default function App() {
    // Sample JSON data (trimmed for example)
    const communityData = [
        {
            religion: "Hindu",
            icon: "🕉️",
            subcaste: [
                {
                    name: "Brahmin",
                    regions: [
                        {
                            code: "HNBR",
                            region: "North",
                            subnames: ["Kanyakubj", "Gaur", "Maithil", "Kashmiri Pandit"]
                        },
                        {
                            code: "HSBR",
                            region: "South",
                            subnames: ["Iyer", "Iyengar", "Smartha"]
                        }
                    ]
                },
                {
                    name: "Rajput/Kshatriya",
                    regions: [
                        {
                            code: "HNRA",
                            region: "North",
                            subnames: ["Chauhan", "Rathore", "Sisodia", "Bundela"]
                        }
                    ]
                }
            ]
        },
        {
            religion: "Muslim",
            icon: "☪️",
            subcaste: [
                {
                    name: "Ashraf",
                    regions: [
                        {
                            code: "MNAS",
                            region: "North",
                            subnames: ["Sayyid", "Sheikh", "Pathan"]
                        }
                    ]
                }
            ]
        },
        {
            religion: "Sikh",
            icon: "🛕",
            subcaste: [
                {
                    name: "Jat Sikh",
                    regions: [
                        {
                            code: "SNJT",
                            region: "North",
                            subnames: ["Sandhu", "Gill", "Dhillon"]
                        }
                    ]
                }
            ]
        }
    ];
    const [selectedReligion, setSelectedReligion] = useState(null);
    const [userSelection, setUserSelection] = useState("");

    const handleReligionClick = (religion) => {
        setSelectedReligion(religion);
        setUserSelection(""); // reset selection if changing religion
    };

    const handleSubcasteClick = (code) => {
        setUserSelection(code);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {!selectedReligion ? (
                <>
                    <h2 className="text-2xl font-bold mb-4">Select Religion</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {communityData.map((rel, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleReligionClick(rel)}
                                className="cursor-pointer p-6 rounded-2xl shadow-md bg-white hover:shadow-lg transition flex flex-col items-center"
                            >
                                <span className="text-4xl">{rel.icon}</span>
                                <p className="mt-2 font-semibold text-lg">{rel.religion}</p>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <button
                        onClick={() => setSelectedReligion(null)}
                        className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                        ⬅ Back
                    </button>
                    <h2 className="text-2xl font-bold mb-4">
                        Select Subcaste in {selectedReligion.religion}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedReligion.subcaste.map((sc, idx) =>
                            sc.regions.map((reg, rIdx) => (
                                <div
                                    key={reg.code}
                                    onClick={() => handleSubcasteClick(reg.code)}
                                    className={`cursor-pointer p-6 rounded-2xl shadow-md bg-white hover:shadow-lg transition ${userSelection === reg.code ? "ring-2 ring-blue-500" : ""
                                        }`}
                                >
                                    <p className="text-sm text-gray-500">
                                        {selectedReligion.religion} • {reg.region}
                                    </p>
                                    <p className="text-lg font-bold">{sc.name}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {reg.subnames.join(", ")}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {userSelection && (
                        <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg">
                            ✅ Selected Code: <span className="font-mono">{userSelection}</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

