/* =========================================================
   CHOICE FOUNDATION
   PSYCHOLOGICAL ASSESSMENT REPORT GENERATOR
   COMPLETE SCRIPT.JS
   ========================================================= */


/* =========================================================
   BASIC HELPERS
   ========================================================= */

const $ = id => document.getElementById(id);

let currentStep = 1;

let assessment = {
    matrix: null,
    snap: false,

    // Independent SLD screening checkbox
    sldScreened: false,

    child: {},

    cpm: null,
    spm: null,
    snapData: null
};


/* =========================================================
   CONFIGURATION
   ========================================================= */

const REPORT_LOGO = "logo.png";
const ASSESSORS = {

    "Athira CM": {
        qualification: "M.Sc (Applied Psychology)",
        designation: "Counselling Psychologist",
        organisation: "Choice Foundation"
    },

    "Swapna": {
        qualification: "M.Sc (Applied Psychology)",
        designation: "Counselling Psychologist",
        organisation: "Choice Foundation"
    },

    "Indrani": {
        qualification: "M.Sc (Applied Psychology)",
        designation: "Counselling Psychologist",
        organisation: "Choice Foundation"
    },

    "Yuktha": {
        qualification: "M.Phil(Rehab.Psy), M.Sc (Applied Psychology)",
        designation: "Counselling Psychologist",
        organisation: "Choice Foundation"
    },

    "Jayanth": {
        qualification: "M.Sc (Applied Psychology)",
        designation: "Counselling Psychologist",
        organisation: "Choice Foundation"
    },

    "Ashwin": {
        qualification: "M.Sc (Applied Psychology)",
        designation: "Counselling Psychologist",
        organisation: "Choice Foundation"
    }

};
/* =========================================================
   DATE HELPERS
   ========================================================= */

function parseDateInput(value) {

    if (!value) return null;

    const parts = value.split("-");

    if (parts.length !== 3) return null;

    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);

    const date = new Date(year, month, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
}


function startOfDay(date) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}


function validateAssessmentDate(value) {

    const selected = parseDateInput(value);

    if (!selected) {

        return {
            valid: false,
            message: "Please enter a valid assessment date."
        };
    }

    const today = startOfDay(new Date());

    if (selected > today) {

        return {
            valid: false,
            message: "Assessment date cannot be after today's date."
        };
    }

    const oneMonthAgo = new Date(today);

    oneMonthAgo.setMonth(
        oneMonthAgo.getMonth() - 1
    );

    if (selected < oneMonthAgo) {

        return {
            valid: false,
            message:
                "Assessment date cannot be older than one month."
        };
    }

    return {
        valid: true
    };
}


/* =========================================================
   AGE HELPERS
   ========================================================= */

function getAgeFromFields(prefix) {

    const yearsElement =
        $(prefix + "AgeYears");

    const monthsElement =
        $(prefix + "AgeMonths");

    if (
        yearsElement &&
        monthsElement
    ) {

        const years =
            Number(yearsElement.value);

        const months =
            Number(monthsElement.value);

        if (
            !Number.isInteger(years) ||
            !Number.isInteger(months)
        ) {

            return null;
        }

        if (
            years < 0 ||
            years > 100 ||
            months < 0 ||
            months > 11
        ) {

            return null;
        }

        return {
            years,
            months
        };
    }

    const oldElement =
        $(prefix + "Age");

    if (!oldElement) {
        return null;
    }

    const value =
        String(oldElement.value || "").trim();

    if (!value) {
        return null;
    }

    /*
       Supports:
       7
       7.5
       7.6
       7.10

       Decimal notation is interpreted as years.months
       for compatibility with the previous application.
    */

    const match =
        value.match(/^(\d+)(?:\.(\d+))?$/);

    if (!match) {
        return null;
    }

    const years =
        Number(match[1]);

    let months =
        match[2]
            ? Number(match[2])
            : 0;

    if (!Number.isFinite(years)) {
        return null;
    }

    /*
       If entered as 7.10, interpret as
       7 years 10 months.
    */

    if (months > 11) {

        months =
            Number(
                String(match[2]).slice(0, 2)
            );
    }

    if (
        years < 0 ||
        years > 100 ||
        months < 0 ||
        months > 11
    ) {

        return null;
    }

    return {
        years,
        months
    };
}


/* =========================================================
   AGE NORMALISATION
   ========================================================= */

/* =========================================================
   AGE NORMALISATION
   ========================================================= */

function normaliseAgeForCPM(age) {

    if (!age) {
        return null;
    }

    const years = Number(age.years);
    const months = Number(age.months);

    if (
        !Number.isFinite(years) ||
        !Number.isFinite(months)
    ) {
        return null;
    }

    return {
        years: years,
        months: months
    };
}
function ageLabel(age) {

    if (!age) return "—";

    return (
        age.years +
        " years " +
        age.months +
        " months"
    );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function openStep(step) {

    currentStep = step;

    document
        .querySelectorAll(".step-page")
        .forEach(page => {
            page.classList.remove("active-page");
        });

    const selectedPage = $("step" + step);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }

    document
        .querySelectorAll(".nav-step")
        .forEach(button => {

            button.classList.toggle(
                "active",
                Number(button.dataset.step) === step
            );

        });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    /* =========================================
       STEP 2
       ========================================= */

    if (step === 2) {
        readInstrumentSelection();
        updateInstrumentSummary();
    }


    /* =========================================
       STEP 3
       ========================================= */

    if (step === 3) {
        renderScoreFields();
    }


    /* =========================================
       STEP 4 — COMPLETE REPORT PREVIEW
       ========================================= */

    if (step === 4) {

        renderReport();
    }


    /* =========================================
       STEP 5 — SAVE AS PDF
       ========================================= */

    if (step === 5) {

        renderReport();
    }

}


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(message) {

    const box =
        $("messageBox");

    if (!box) {

        alert(message);
        return;
    }

    box.textContent =
        message;

    box.classList.remove(
        "hidden"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    setTimeout(() => {

        box.classList.add(
            "hidden"
        );

    }, 4000);
}


/* =========================================================
   CHILD INFORMATION
   ========================================================= */

function readChildInformation() {

    const name =
        $("childName")?.value.trim() || "";

    const uid =
        $("uid")?.value.trim() || "";

    const classValue =
        $("className")?.value.trim() || "";

    const school =
        $("schoolName")?.value.trim() || "";

    const gender =
        $("gender")?.value || "";

    const assessmentDate =
        $("assessmentDate")?.value || "";

    const assessedBy =
        $("assessedBy")?.value || "Athira";

    assessment.child = {

        name,

        uid,

        class: classValue,

        className: classValue,

        school,

        schoolName: school,

        gender,

        assessmentDate,

        date: assessmentDate,

        ageYears:
            assessment.child?.ageYears || "",

        ageMonths:
            assessment.child?.ageMonths || "",

        assessedBy
    };
}


function validateChildInformation() {

    readChildInformation();

    if (!assessment.child.name) {

        showMessage(
            "Please enter the child's name."
        );

        return false;
    }

    if (!assessment.child.uid) {

        showMessage(
            "Please enter the UID / Case ID."
        );

        return false;
    }

    if (!assessment.child.class) {

        showMessage(
            "Please enter the child's class."
        );

        return false;
    }

    if (!assessment.child.school) {

        showMessage(
            "Please enter the school name."
        );

        return false;
    }

    if (!assessment.child.gender) {

        showMessage(
            "Please select gender."
        );

        return false;
    }

    if (!assessment.child.assessmentDate) {

        showMessage(
            "Please enter the assessment date."
        );

        return false;
    }

    const dateCheck =
        validateAssessmentDate(
            assessment.child.assessmentDate
        );

    if (!dateCheck.valid) {

        showMessage(
            dateCheck.message
        );

        return false;
    }

    return true;
}


/* =========================================================
   INSTRUMENT SELECTION
   ========================================================= */

function readInstrumentSelection() {

    const matrix =
        document.querySelector(
            'input[name="matrix"]:checked'
        );

    assessment.matrix =
        matrix
            ? matrix.value
            : null;

    assessment.snap =
        $("snapSelected")
            ? $("snapSelected").checked
            : false;
}


function updateInstrumentSummary() {

    readInstrumentSelection();

    const selected = [];

    if (
        assessment.matrix === "CPM"
    ) {

        selected.push("CPM");
    }

    if (
        assessment.matrix === "SPM"
    ) {

        selected.push("SPM");
    }

    if (assessment.snap) {

        selected.push("SNAP-IV");
    }

    if ($("instrumentSummary")) {

        if (!selected.length) {

            $("instrumentSummary").textContent =
                "No instrument selected.";

        } else {

            $("instrumentSummary").innerHTML =
                "<strong>Selected:</strong> " +
                selected.join(" • ");
        }
    }

    if ($("summaryTests")) {

        if (!selected.length) {

            $("summaryTests").innerHTML =
                '<span class="empty-chip">None</span>';

        } else {

            $("summaryTests").innerHTML =
                selected
                    .map(test =>
                        `<span class="summary-chip">${test}</span>`
                    )
                    .join("");
        }
    }

    renderLiveSummary();
}


/* =========================================================
   SCORE FIELD GENERATION
   ========================================================= */

function renderScoreFields() {

    readInstrumentSelection();

    let html = "";

    if (
        !assessment.matrix &&
        !assessment.snap
    ) {

        if ($("scoreContainer")) {

            $("scoreContainer").innerHTML =
                '<div class="score-help">Please select an assessment instrument first.</div>';
        }

        return;
    }


    /* =====================================================
       CPM
       ===================================================== */

    if (
        assessment.matrix === "CPM"
    ) {

        html += `

        <div class="score-card">

            <div class="score-card-header">

                <strong>
                    Raven's Coloured Progressive Matrices (CPM)
                </strong>

                <span>
                    Overall Score
                </span>

            </div>

            <div class="score-grid">

                <div class="score-field">

                    <label>
                        Age — Years
                    </label>

                    <input
                        type="number"
                        id="cpmAgeYears"
                        min="4"
                        max="12"
                        step="1"
                        placeholder="Years"
                    >

                </div>


                <div class="score-field">

                    <label>
                        Age — Months
                    </label>

                    <input
                        type="number"
                        id="cpmAgeMonths"
                        min="0"
                        max="11"
                        step="1"
                        placeholder="0 – 11"
                    >

                </div>


                <div class="score-field">

                    <label>
                        CPM Raw Score
                    </label>

                    <input
                        type="number"
                        id="cpmScore"
                        min="0"
                        max="36"
                        step="1"
                        placeholder="0 – 36"
                    >

                </div>

            </div>

            <div class="score-help">

                Enter chronological age in years and months and
                the overall CPM raw score. The score must be between
                0 and 36. Normative classification is calculated
                automatically from the configured CPM reference norms.

            </div>

        </div>

        `;
    }


    /* =====================================================
       SPM
       ===================================================== */

    if (
        assessment.matrix === "SPM"
    ) {

        html += `

        <div class="score-card">

            <div class="score-card-header">

                <strong>
                    Raven's Standard Progressive Matrices (SPM)
                </strong>

                <span>
                    Overall Score
                </span>

            </div>

            <div class="score-grid">

                <div class="score-field">

                    <label>
                        Age — Years
                    </label>

                    <input
                        type="number"
                        id="spmAgeYears"
                        min="8"
                        max="18"
                        step="1"
                        placeholder="Years"
                    >

                </div>


                <div class="score-field">

                    <label>
                        Age — Months
                    </label>

                    <input
                        type="number"
                        id="spmAgeMonths"
                        min="0"
                        max="11"
                        step="1"
                        placeholder="0 – 11"
                    >

                </div>


                <div class="score-field">

                    <label>
                        SPM Raw Score
                    </label>

                    <input
                        type="number"
                        id="spmScore"
                        min="0"
                        max="60"
                        step="1"
                        placeholder="0 – 60"
                    >

                </div>

            </div>

            <div class="score-help">

                Enter the child's age and overall SPM raw score.
                The score must be between 0 and 60.

            </div>

        </div>

        `;
    }

/* =====================================================
   SNAP-IV
   ===================================================== */

if (
    assessment.snap
) {

    html += `

    <div class="score-card">

        <div class="score-card-header">

            <strong>
                SNAP-IV Domain Scores
            </strong>

            <span>
                Domain-wise Entry
            </span>

        </div>


        <div class="score-grid">


            <div class="score-field">

                <label>
                    Age — Years
                </label>

                <input
                    type="number"
                    id="snapAgeYears"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="Years"
                >

            </div>


            <div class="score-field">

                <label>
                    Age — Months
                </label>

                <input
                    type="number"
                    id="snapAgeMonths"
                    min="0"
                    max="11"
                    step="1"
                    placeholder="0 – 11"
                >

            </div>


            <div class="score-field">

                <label>
                    Inattention — Questions 1–9
                </label>

                <input
                    type="number"
                    id="snapInattention"
                    min="0"
                    max="27"
                    step="1"
                    placeholder="0 – 27"
                >

            </div>


            <div class="score-field">

                <label>
                    Hyperactivity / Impulsivity — Questions 10–18
                </label>

                <input
                    type="number"
                    id="snapHyperactivity"
                    min="0"
                    max="27"
                    step="1"
                    placeholder="0 – 27"
                >

            </div>


            <div class="score-field">

                <label>
                    Opposition / Defiance — Questions 19–26
                </label>

                <input
                    type="number"
                    id="snapOpposition"
                    min="0"
                    max="24"
                    step="1"
                    placeholder="0 – 24"
                >

            </div>


        </div>


        <div class="score-help">

            Enter the child's chronological age and the
            domain scores obtained from SNAP-IV scoring.
            This application does not administer SNAP-IV items.

        </div>


    </div>

    `;
}
    if ($("scoreContainer")) {

        $("scoreContainer").innerHTML =
            html;
    }
}


/* =========================================================
   CPM NORMS
   ---------------------------------------------------------
   SOURCE:
   CPM_norms.xlsx supplied by the user.
   ========================================================= */

const CPM_NORMS = {

    "4-0": [
        [0, 5, "<60", 0.1],
        [6, 6, "60", 0.4],
        [7, 7, "65", 1],
        [8, 8, "70", 2.3],
        [9, 10, "75", 5],
        [11, 11, "80", 9],
        [12, 13, "85", 16],
        [14, 14, "90", 25],
        [15, 16, "95", 37],
        [17, 18, "100", 50],
        [19, 19, "105", 63],
        [20, 21, "110", 75],
        [22, 23, "115", 84],
        [24, 25, "120", 91],
        [26, 27, "125", 95],
        [28, 29, "130", 97.7],
        [30, 31, "135", 99],
        [32, 33, "140", 99.6],
        [34, 36, ">140", 99.9]
    ],

    "4-6": [
        [0, 6, "<60", 0.1],
        [7, 7, "60", 0.4],
        [8, 8, "65", 1],
        [9, 9, "70", 2.3],
        [10, 10, "75", 5],
        [11, 12, "80", 9],
        [13, 14, "85", 16],
        [15, 15, "90", 25],
        [16, 17, "95", 37],
        [18, 19, "100", 50],
        [20, 20, "105", 63],
        [21, 22, "110", 75],
        [23, 24, "115", 84],
        [25, 26, "120", 91],
        [27, 28, "125", 95],
        [29, 30, "130", 97.7],
        [31, 32, "135", 99],
        [33, 34, "140", 99.6],
        [35, 36, ">140", 99.9]
    ],

    "5-0": [
        [0, 7, "<60", 0.1],
        [8, 8, "60", 0.4],
        [9, 9, "65", 1],
        [10, 10, "70", 2.3],
        [11, 12, "75", 5],
        [13, 13, "80", 9],
        [14, 15, "85", 16],
        [16, 17, "90", 25],
        [18, 19, "95", 37],
        [20, 21, "100", 50],
        [22, 22, "105", 63],
        [23, 24, "110", 75],
        [25, 26, "115", 84],
        [27, 28, "120", 91],
        [29, 30, "125", 95],
        [31, 32, "130", 97.7],
        [33, 34, "135", 99],
        [35, 35, "140", 99.6],
        [36, 36, ">140", 99.9]
    ],

    "5-6": [
        [0, 8, "<60", 0.1],
        [9, 9, "60", 0.4],
        [10, 10, "65", 1],
        [11, 11, "70", 2.3],
        [12, 13, "75", 5],
        [14, 14, "80", 9],
        [15, 16, "85", 16],
        [17, 18, "90", 25],
        [19, 20, "95", 37],
        [21, 22, "100", 50],
        [23, 23, "105", 63],
        [24, 25, "110", 75],
        [26, 27, "115", 84],
        [28, 29, "120", 91],
        [30, 31, "125", 95],
        [32, 33, "130", 97.7],
        [34, 35, "135", 99],
        [36, 36, "140", 99.6]
    ],

    "6-0": [
        [0, 9, "<60", 0.1],
        [10, 10, "60", 0.4],
        [11, 11, "65", 1],
        [12, 12, "70", 2.3],
        [13, 14, "75", 5],
        [15, 15, "80", 9],
        [16, 17, "85", 16],
        [18, 19, "90", 25],
        [20, 21, "95", 37],
        [22, 23, "100", 50],
        [24, 24, "105", 63],
        [25, 26, "110", 75],
        [27, 28, "115", 84],
        [29, 30, "120", 91],
        [31, 32, "125", 95],
        [33, 34, "130", 97.7],
        [35, 35, "135", 99],
        [36, 36, "140", 99.6]
    ],

    "6-6": [
        [0, 10, "<60", 0.1],
        [11, 11, "60", 0.4],
        [12, 12, "65", 1],
        [13, 13, "70", 2.3],
        [14, 15, "75", 5],
        [16, 16, "80", 9],
        [17, 18, "85", 16],
        [19, 20, "90", 25],
        [21, 22, "95", 37],
        [23, 24, "100", 50],
        [25, 25, "105", 63],
        [26, 27, "110", 75],
        [28, 29, "115", 84],
        [30, 31, "120", 91],
        [32, 33, "125", 95],
        [34, 35, "130", 97.7],
        [36, 36, "135", 99]
    ],

    "7-0": [
        [0, 11, "<60", 0.1],
        [12, 12, "60", 0.4],
        [13, 13, "65", 1],
        [14, 14, "70", 2.3],
        [15, 16, "75", 5],
        [17, 17, "80", 9],
        [18, 19, "85", 16],
        [20, 21, "90", 25],
        [22, 23, "95", 37],
        [24, 25, "100", 50],
        [26, 26, "105", 63],
        [27, 28, "110", 75],
        [29, 30, "115", 84],
        [31, 32, "120", 91],
        [33, 34, "125", 95],
        [35, 35, "130", 97.7],
        [36, 36, "135", 99]
    ],

    "7-6": [
        [0, 11, "<60", 0.1],
        [12, 12, "60", 0.4],
        [13, 13, "65", 1],
        [14, 14, "70", 2.3],
        [15, 16, "75", 5],
        [17, 17, "80", 9],
        [18, 19, "85", 16],
        [20, 21, "90", 25],
        [22, 23, "95", 37],
        [24, 25, "100", 50],
        [26, 26, "105", 63],
        [27, 28, "110", 75],
        [29, 30, "115", 84],
        [31, 32, "120", 91],
        [33, 34, "125", 95],
        [35, 35, "130", 97.7],
        [36, 36, "135", 99]
    ],

    "8-0": [
        [0, 12, "<60", 0.1],
        [13, 13, "60", 0.4],
        [14, 14, "65", 1],
        [15, 15, "70", 2.3],
        [16, 17, "75", 5],
        [18, 18, "80", 9],
        [19, 20, "85", 16],
        [21, 22, "90", 25],
        [23, 24, "95", 37],
        [25, 26, "100", 50],
        [27, 27, "105", 63],
        [28, 29, "110", 75],
        [30, 31, "115", 84],
        [32, 33, "120", 91],
        [34, 35, "125", 95],
        [36, 36, "130", 97.7]
    ],

        "8-6": [
        [0, 12, "<60", 0.1],
        [13, 13, "60", 0.4],
        [14, 14, "65", 1],
        [15, 15, "70", 2.3],
        [16, 17, "75", 5],
        [18, 18, "80", 9],
        [19, 20, "85", 16],
        [21, 22, "90", 25],
        [23, 24, "95", 37],
        [25, 26, "100", 50],
        [27, 27, "105", 63],
        [28, 29, "110", 75],
        [30, 31, "115", 84],
        [32, 33, "120", 91],
        [34, 35, "125", 95],
        [36, 36, "130", 97.7]
    ],

    /* =========================================================
       CPM HIGHER-AGE NORMS — SUPPLIED DATA
       These extend the existing CPM norms.
       Existing 4–8 year norms are NOT replaced.
       ========================================================= */

    "9-0": [
        [0, 12, "<60", 0.1],
        [13, 14, "60", 0.4],
        [15, 16, "65", 1],
        [17, 18, "70", 2.3],
        [19, 20, "75", 5],
        [21, 22, "80", 9],
        [23, 23, "85", 16],
        [24, 25, "90", 25],
        [26, 27, "95", 37],
        [28, 28, "100", 50],
        [29, 30, "105", 63],
        [31, 32, "110", 75],
        [33, 33, "115", 84],
        [34, 34, "120", 91],
        [35, 35, "125", 95],
        [36, 36, "135", 99]
    ],

    "10-0": [
        [0, 14, "<60", 0.1],
        [15, 16, "60", 0.4],
        [17, 18, "65", 1],
        [19, 20, "70", 2.3],
        [21, 22, "75", 5],
        [23, 24, "80", 9],
        [25, 25, "85", 16],
        [26, 27, "90", 25],
        [28, 29, "95", 37],
        [30, 30, "100", 50],
        [31, 31, "105", 63],
        [32, 32, "110", 75],
        [33, 34, "115", 84],
        [35, 35, "120", 91],
        [36, 36, "130", 97.7]
    ],

    "11-0": [
        [0, 16, "<60", 0.1],
        [17, 18, "60", 0.4],
        [19, 20, "65", 1],
        [21, 22, "70", 2.3],
        [23, 23, "75", 5],
        [24, 25, "80", 9],
        [26, 26, "85", 16],
        [27, 28, "90", 25],
        [29, 30, "95", 37],
        [31, 31, "100", 50],
        [32, 32, "105", 63],
        [33, 33, "110", 75],
        [34, 34, "115", 84],
        [35, 35, "120", 91],
        [36, 36, "130", 97.7]
    ]

};
    

/* =========================================================
   CPM NORMS KEY
   ========================================================= */

/* =========================================================
   CPM NORMS KEY
   ========================================================= */

function getCPMNormKey(age) {

    if (!age) {
        return null;
    }

    const years = Number(age.years);
    const months = Number(age.months);

    if (
        !Number.isFinite(years) ||
        !Number.isFinite(months)
    ) {
        return null;
    }

    if (years === 4) {
        return months <= 5 ? "4-0" : "4-6";
    }

    if (years === 5) {
        return months <= 5 ? "5-0" : "5-6";
    }

    if (years === 6) {
        return months <= 5 ? "6-0" : "6-6";
    }

    if (years === 7) {
        return months <= 5 ? "7-0" : "7-6";
    }

    if (years === 8) {
        return months <= 5 ? "8-0" : "8-6";
    }

    if (years === 9) {
        return "9-0";
    }

    if (years === 10) {
        return "10-0";
    }

    if (years === 11) {
        return "11-0";
    }

    return null;
}

/* =========================================================
   CPM PERCENTILE TEXT
   ========================================================= */

function percentileText(percentile) {

    if (
        percentile === null ||
        percentile === undefined
    ) {
        return "—";
    }

    const value =
        Number(percentile);

    if (value === 99.9) {
        return "99.9th  percentile rank";
    }

    if (value === 99.6) {
        return "99.6th  percentile rank";
    }

    if (value === 99) {
        return "99th  percentile rank";
    }

    if (value === 97.7) {
        return "97.7th  percentile rank";
    }

    if (value === 95) {
        return "95th  percentile rank";
    }

    if (value === 91) {
        return "91st  percentile rank";
    }

    if (value === 84) {
        return "84th  percentile rank";
    }

    if (value === 75) {
        return "75th  percentile rank";
    }

    if (value === 63) {
        return "63rd  percentile rank";
    }

    if (value === 50) {
        return "50th  percentile rank";
    }

    if (value === 37) {
        return "37th  percentile rank";
    }

    if (value === 25) {
        return "25th  percentile rank";
    }

    if (value === 16) {
        return "16th  percentile rank";
    }

    if (value === 9) {
        return "9th  percentile rank";
    }

    if (value === 5) {
        return "5th  percentile rank";
    }

    if (value === 2.3) {
        return "2.3rd  percentile rank";
    }

    if (value === 1) {
        return "1st  percentile rank";
    }

    if (value === 0.4) {
        return "0.4th  percentile rank";
    }

    if (value === 0.1) {
        return "0.1st  percentile rank";
    }

    return value + "th percentile rank";
}


/* =========================================================
   CPM CLASSIFICATION
   ========================================================= */

function getCPMClassification(percentile) {

    const p =
        Number(percentile);

    if (!Number.isFinite(p)) {

        return {
            grade: "—",
            classification: "Score Not Classified"
        };
    }

    /*
       Grade I:
       >= 95th percentile
    */

    if (p >= 95) {

        return {
            grade: "Grade I",
            classification:
                "Intellectually Superior"
        };
    }

    /*
       Grade II:
       >= 75th and < 95th percentile
    */

    if (p >= 75) {

        return {
            grade: "Grade II",
            classification:
                "Above Average in Intelligence"
        };
    }

    /*
       Grade III:
       > 25th and < 75th percentile
    */

    if (p > 25) {

        return {
            grade: "Grade III",
            classification:
                "Intellectually Average"
        };
    }

    /*
       Grade IV:
       > 5th and <= 25th percentile
    */

    if (p > 5) {

        return {
            grade: "Grade IV",
            classification:
                "Below Average Intelligence"
        };
    }

    /*
       Grade V:
       <= 5th percentile
    */

    return {
        grade: "Grade V",
        classification:
            "Intellectually Impaired"
    };
}


/* =========================================================
   CPM INTERPRETATION
   ========================================================= */

/* =========================================================
   CPM INTERPRETATION
   ========================================================= */

function getCPMInterpretation(percentile, standardScore, grade, classification) {
    const p = Number(percentile);

    if (!Number.isFinite(p)) {
        return "CPM interpretation is not available because the percentile could not be determined from the configured norms.";
    }

    const classificationData = getCPMClassification(p);
    const finalGrade = grade || classificationData.grade || "Not available";
    const finalClassification = classification || classificationData.classification || "Not classified";
    const finalStandardScore =
        standardScore !== null &&
        standardScore !== undefined &&
        standardScore !== ""
            ? standardScore
            : "Not available";

    const percentileStatement = percentileText(p) || `${p}th percentile`;

    const opening =
        `The CPM performance falls at the ${percentileStatement} relative to the normative reference group, corresponding to ${finalGrade} (${finalClassification}), with a Standard Score of ${finalStandardScore}. `;

    if (p <= 5) {
        return opening +
            "This indicates performance in the intellectually impaired range on this measure of non-verbal reasoning. Visual reasoning, pattern recognition and non-verbal problem-solving may require further evaluation in the context of the child's overall developmental, academic and functional profile.";
    }

    if (p <= 25) {
        return opening +
            "This indicates below-average performance for age and may reflect relative difficulty with visual reasoning, pattern recognition and non-verbal problem-solving. The finding should be considered together with academic functioning and other developmental information.";
    }

    if (p < 75) {
        return opening +
            "This indicates broadly age-appropriate non-verbal reasoning ability within the average range. The result should be interpreted alongside academic performance, developmental history and behavioural observations.";
    }

    if (p < 95) {
        return opening +
            "This indicates above-average non-verbal reasoning ability, with comparatively well-developed visual reasoning, pattern recognition and non-verbal problem-solving skills.";
    }

    return opening +
        "This indicates intellectually superior performance, reflecting exceptionally strong non-verbal reasoning, visual pattern recognition and non-verbal problem-solving abilities.";
}

/* =========================================================
   CPM CLASSIFICATION / CALCULATION
   ========================================================= */

/* =========================================================
   CPM CLASSIFICATION / CALCULATION
   ========================================================= */

function classifyCPM(age, rawScore) {

    const score = Number(rawScore);

    /*
       Basic score validation
    */

    if (!Number.isFinite(score)) {

        return {
            valid: false,
            rawScore: null,
            score: null,
            percentile: null,
            percentileText: "Not available",
            standardScore: null,
            grade: "Not available",
            classification: "Invalid Score",
            interpretation:
                "Please enter a valid CPM raw score."
        };
    }

    if (score < 0 || score > 36) {

        return {
            valid: false,
            rawScore: score,
            score: score,
            percentile: null,
            percentileText: "Not available",
            standardScore: null,
            grade: "Not available",
            classification: "Invalid Score",
            interpretation:
                "CPM raw score must be between 0 and 36."
        };
    }

    /*
       Determine the CPM norm table
       applicable to the child's age.
    */

    const key = getCPMNormKey(age);

    if (!key) {

        return {
            valid: false,
            rawScore: score,
            score: score,
            percentile: null,
            percentileText: "Not available",
            standardScore: null,
            grade: "Not available",
            classification: "Norm Not Configured",
            interpretation:
                "No CPM normative table is available for the entered age."
        };
    }

    const norms = CPM_NORMS[key];

    if (!Array.isArray(norms) || norms.length === 0) {

        return {
            valid: false,
            rawScore: score,
            score: score,
            percentile: null,
            percentileText: "Not available",
            standardScore: null,
            grade: "Not available",
            classification: "Norm Not Configured",
            interpretation:
                "No CPM normative band is available for the entered age."
        };
    }

    /*
       Find the exact supplied raw-score band.
       No interpolation is performed.
    */

    let matchedBand = null;

    for (const band of norms) {

        if (!Array.isArray(band) || band.length < 4) {
            continue;
        }

        const minScore = Number(band[0]);
        const maxScore = Number(band[1]);

        if (
            score >= minScore &&
            score <= maxScore
        ) {
            matchedBand = band;
            break;
        }
    }

    /*
       Valid raw score but no configured
       normative band.
    */

    if (!matchedBand) {

        return {
            valid: true,
            normKey: key,
            rawScore: score,
            score: score,
            percentile: null,
            percentileText: "Not available",
            standardScore: null,
            grade: "Not available",
            classification: "Score Not Classified",
            interpretation:
                "The entered CPM raw score is valid, but no explicit normative band is provided for this score and age."
        };
    }

    const standardScore =
        matchedBand[2];

    const percentile =
        Number(matchedBand[3]);

    const percentileStatement =
        percentileText(percentile);

    /*
       Determine CPM grade and classification.
    */

    let grade = "";
    let description = "";

    if (percentile >= 95) {

        grade = "Grade I";
        description = "Intellectually Superior";

    } else if (percentile >= 75) {

        grade = "Grade II";
        description = "Above Average in Intelligence";

    } else if (percentile > 25) {

        grade = "Grade III";
        description = "Intellectually Average";

    } else if (percentile > 5) {

        grade = "Grade IV";
        description = "Below Average Intelligence";

    } else {

        grade = "Grade V";
        description = "Intellectually Impaired";
    }

    /*
       Create the interpretation only after
       grade and classification are known.
    */

    const interpretation =
        getCPMInterpretation(
            percentile,
            standardScore,
            grade,
            description
        );

    /*
       Return BOTH rawScore and score.
       This keeps existing report functions
       compatible while fixing the data model.
    */

    return {

        valid: true,

        normKey: key,

        rawScore: score,

        score: score,

        standardScore: standardScore,

        percentile: percentile,

        percentileText: percentileStatement,

        grade: grade,

        classification: description,

        interpretation: interpretation
    };
}

/* =========================================================
   CPM RECOMMENDATIONS
   ========================================================= */

function getCPMRecommendations(
    cpm
) {

    const recommendations = [];


    if (
        !cpm ||
        !cpm.valid
    ) {

        return recommendations;
    }


    const p =
        Number(cpm.percentile);


    if (
        p > 25
    ) {

        recommendations.push(
            "No significant concerns are identified in non-verbal reasoning based on the present CPM findings."
        );

        recommendations.push(
            "If academic or behavioural concerns are identified, consultation with a Rehabilitation Psychologist or Clinical Psychologist may be considered for further evaluation."
        );

        return recommendations;
    }


    recommendations.push(
        "A comprehensive psychological assessment is recommended. Kindly consult a nearby Rehabilitation Psychologist or Clinical Psychologist, or visit Little Stars & She (Kondapur) or NIEPID, Secunderabad, for further evaluation."
    );


    recommendations.push(
        "The child's academic functioning and learning needs may be reviewed in greater detail to determine whether additional educational or psychological support is required."
    );


    return recommendations;
}


/* =========================================================
   SPM NORMS
   ========================================================= */

const SPM_NORMS = {

    8: {
        p95: 43,
        p90: 40,
        p75: 34.5,
        p50: 24.5,
        p25: 14.5,
        p10: 11,
        p5: 10
    },

    9: {
        p95: 46,
        p90: 43.5,
        p75: 37.5,
        p50: 29,
        p25: 17.5,
        p10: 12.5,
        p5: 11
    },

    10: {
        p95: 48,
        p90: 45,
        p75: 40.5,
        p50: 34,
        p25: 23.5,
        p10: 14.5,
        p5: 12
    },

    11: {
        p95: 51,
        p90: 49.5,
        p75: 45,
        p50: 38.5,
        p25: 30.5,
        p10: 19,
        p5: 14
    },

    12: {
        p95: 52.5,
        p90: 51.5,
        p75: 47,
        p50: 42,
        p25: 33.5,
        p10: 23,
        p5: 16
    },

    13: {
        p95: 53.5,
        p90: 52.5,
        p75: 47.5,
        p50: 42.5,
        p25: 35.5,
        p10: 26,
        p5: 18
    },

    14: {
        p95: 54.5,
        p90: 53.5,
        p75: 48.5,
        p50: 43.5,
        p25: 36,
        p10: 27,
        p5: 23
    },

    15: {
        p95: 54.5,
        p90: 54.5,
        p75: 49.5,
        p50: 44.5,
        p25: 38,
        p10: 30,
        p5: 26
    },

    16: {
        p95: 55,
        p90: 54.5,
        p75: 51.5,
        p50: 45.5,
        p25: 39.5,
        p10: 32,
        p5: 27
    },

    17: {
        p95: 55,
        p90: 53.5,
        p75: 50,
        p50: 45.5,
        p25: 38.5,
        p10: 31.5,
        p5: 24
    },

    18: {
        p95: 53,
        p90: 51.5,
        p75: 48.5,
        p50: 43.5,
        p25: 37.5,
        p10: 29,
        p5: 25
    }

};


/* =========================================================
   SPM CLASSIFICATION
   ========================================================= */
/* =========================================================
   SPM CLASSIFICATION — MANUAL-BASED
   ========================================================= */

/* =========================================================
   SPM CLASSIFICATION
   ========================================================= */

function classifySPM(
    age,
    score
) {

    /*
       -------------------------------------------------------
       VALIDATE AGE
       -------------------------------------------------------
    */

    if (!age) {

        return {
            valid: false,
            grade: "—",
            percentile: "—",
            classification:
                "Invalid Age",
            interpretation:
                "Please enter the child's chronological age."
        };
    }


    if (
        !Number.isInteger(age.years) ||
        !Number.isInteger(age.months)
    ) {

        return {
            valid: false,
            grade: "—",
            percentile: "—",
            classification:
                "Invalid Age",
            interpretation:
                "Age must be entered in complete years and months."
        };
    }


    if (
        age.months < 0 ||
        age.months > 11
    ) {

        return {
            valid: false,
            grade: "—",
            percentile: "—",
            classification:
                "Invalid Age",
            interpretation:
                "Age must be entered using valid years and months. Months must be between 0 and 11."
        };
    }


    /*
       -------------------------------------------------------
       USE COMPLETED YEARS FOR SPM NORM GROUP
       -------------------------------------------------------
    */

    const ageKey =
        age.years;


    if (
        ageKey < 8 ||
        ageKey > 18
    ) {

        return {
            valid: false,
            grade: "—",
            percentile: "—",
            classification:
                "Norm Not Available",
            interpretation:
                "SPM norms are currently configured for ages 8 through 18 years."
        };
    }


    /*
       -------------------------------------------------------
       VALIDATE RAW SCORE
       -------------------------------------------------------
    */

    if (
        !Number.isInteger(score) ||
        score < 0 ||
        score > 60
    ) {

        return {
            valid: false,
            grade: "—",
            percentile: "—",
            classification:
                "Invalid Score",
            interpretation:
                "SPM raw score must be a whole number between 0 and 60."
        };
    }


    /*
       -------------------------------------------------------
       GET AGE-SPECIFIC NORMS
       -------------------------------------------------------
    */

    const norms =
        SPM_NORMS[ageKey];


    if (!norms) {

        return {
            valid: false,
            grade: "—",
            percentile: "—",
            classification:
                "Norm Not Available",
            interpretation:
                "No SPM normative reference is available for the entered age."
        };
    }


    /*
       -------------------------------------------------------
       CLASSIFICATION VARIABLES
       -------------------------------------------------------
    */

    let grade = "";
    let percentile = "";
    let classification = "";
    let interpretation = "";


    /*
       -------------------------------------------------------
       GRADE I
       >= 95th percentile
       -------------------------------------------------------
    */

    if (
        score >= norms.p95
    ) {

        grade =
            "Grade I";

        percentile =
            "95th percentile and above";

        classification =
            "Intellectually Superior";

        interpretation =
            "The child's performance on Raven's Standard Progressive Matrices indicates non-verbal reasoning and clear-thinking ability above the expected level for the comparative age group. The performance suggests comparatively well-developed ability to identify visual relationships, recognize patterns, integrate visual information, and determine the missing element within logical sequences.";


    /*
       -------------------------------------------------------
       GRADE II+
       >= 90th and < 95th percentile
       -------------------------------------------------------
    */

    } else if (
        score >= norms.p90
    ) {

        grade =
            "Grade II+";

        percentile =
            "90th–94th percentile";

        classification =
            "Definitely Above Average in Intellectual Capacity";

        interpretation =
            "The child's performance on Raven's Standard Progressive Matrices indicates non-verbal reasoning and clear-thinking ability above the expected level for the comparative age group. The performance suggests comparatively well-developed ability to identify visual relationships, recognize patterns, integrate visual information, and determine the missing element within logical sequences.";


    /*
       -------------------------------------------------------
       GRADE II
       >= 75th and < 90th percentile
       -------------------------------------------------------
    */

    } else if (
        score >= norms.p75
    ) {

        grade =
            "Grade II";

        percentile =
            "75th–89th percentile";

        classification =
            "Definitely Above Average in Intellectual Capacity";

        interpretation =
            "The child's performance on Raven's Standard Progressive Matrices indicates non-verbal reasoning and clear-thinking ability above the expected level for the comparative age group. The performance suggests comparatively well-developed ability to identify visual relationships, recognize patterns, integrate visual information, and determine the missing element within logical sequences.";


    /*
       -------------------------------------------------------
       GRADE III+
       > 50th and < 75th percentile
       -------------------------------------------------------
    */

    } else if (
        score > norms.p50
    ) {

        grade =
            "Grade III+";

        percentile =
            "Above the median and below the 75th percentile";

        classification =
            "Intellectually Average";

        interpretation =
            "The child's performance on Raven's Standard Progressive Matrices indicates broadly age-appropriate non-verbal reasoning and clear-thinking ability relative to the comparative age group. The performance is above the median within the age-based normative group and suggests broadly age-appropriate ability to identify visual relationships, recognize patterns, integrate visual information, and determine the missing element within logical sequences.";


    /*
       -------------------------------------------------------
       GRADE III
       EXACTLY AT MEDIAN
       -------------------------------------------------------
    */

    } else if (
        score === norms.p50
    ) {

        grade =
            "Grade III";

        percentile =
            "At the 50th percentile";

        classification =
            "Intellectually Average";

        interpretation =
            "The child's performance on Raven's Standard Progressive Matrices falls within the intellectually average range for the comparative age group. The performance indicates broadly age-appropriate non-verbal reasoning and clear-thinking ability, including the ability to identify visual relationships, recognize patterns, integrate visual information, and determine the missing element within logical sequences.";


    /*
       -------------------------------------------------------
       GRADE III−
       > 25th and < 50th percentile
       -------------------------------------------------------
    */

    } else if (
        score > norms.p25
    ) {

        grade =
            "Grade III−";

        percentile =
            "Above the 25th percentile and below the median";

        classification =
            "Intellectually Average";

        interpretation =
            "The child's performance on Raven's Standard Progressive Matrices remains within the intellectually average range for the comparative age group, although it is below the median of the age-based normative group. The performance suggests broadly age-appropriate non-verbal reasoning and clear-thinking ability, with relatively lower performance within the average range in identifying visual relationships, recognizing patterns, integrating visual information, and determining the missing element within logical sequences.";


    /*
       -------------------------------------------------------
       GRADE IV
       > 10th and <= 25th percentile
       -------------------------------------------------------
    */

    } else if (
        score > norms.p10
    ) {

        grade =
            "Grade IV";

        percentile =
            "Above the 10th percentile and at or below the 25th percentile";

        classification =
            "Definitely Below Average in Intellectual Capacity";

        interpretation =
            "The child's performance on Raven's Standard Progressive Matrices indicates comparatively lower non-verbal reasoning and clear-thinking performance relative to the comparative age group. The result may reflect greater difficulty, relative to age peers, in identifying visual relationships, recognizing patterns, integrating visual information, and determining the missing element within logical sequences. These findings suggest relative difficulty in aspects of non-verbal reasoning and visual problem solving and may benefit from targeted educational or developmental support. The finding should be considered together with the child's academic functioning, developmental history, behavioural observations and other assessment findings.";


    /*
       -------------------------------------------------------
       GRADE IV−
       > 5th and <= 10th percentile
       -------------------------------------------------------
    */

    } else if (
        score > norms.p5
    ) {

        grade =
            "Grade IV−";

        percentile =
            "Above the 5th percentile and at or below the 10th percentile";

        classification =
            "Definitely Below Average in Intellectual Capacity";

        interpretation =
            "The child's performance on Raven's Standard Progressive Matrices indicates comparatively lower non-verbal reasoning and clear-thinking performance relative to the comparative age group. The result may reflect greater difficulty, relative to age peers, in identifying visual relationships, recognizing patterns, integrating visual information, and determining the missing element within logical sequences. These findings suggest relative difficulty in aspects of non-verbal reasoning and visual problem solving and may benefit from targeted educational or developmental support. The finding should be considered together with the child's academic functioning, developmental history, behavioural observations and other assessment findings.";


    /*
       -------------------------------------------------------
       GRADE V
       <= 5th percentile
       -------------------------------------------------------
    */

    } else {

        grade =
            "Grade V";

        percentile =
            "5th percentile and below";

        classification =
            "Intellectually Impaired";

        interpretation =
            "The child's performance on Raven's Standard Progressive Matrices falls substantially below the expected range for the comparative age group. This pattern suggests significant difficulty, relative to age peers, with non-verbal reasoning processes involved in identifying visual relationships, recognizing patterns, integrating visual information, and determining the missing element within logical sequences. The finding warrants consideration of targeted educational or developmental support and further evaluation of the child's broader cognitive, academic, developmental and functional profile. The SPM result should not be interpreted in isolation as establishing a diagnosis of intellectual disability.";
    }


    /*
       -------------------------------------------------------
       RETURN SPM RESULT
       -------------------------------------------------------
    */

    return {

        valid:
            true,

        ageEntered:
            age,

        ageUsed:
            ageKey,

        score:
            score,

        grade:
            grade,

        percentile:
            percentile,

        classification:
            classification,

        interpretation:
            interpretation,

        detailedInterpretation:
            getSPMInterpretation(
                grade,
                classification
            )
    };
}
/* =========================================================
   SPM DETAILED INTERPRETATION
   ========================================================= */

function getSPMInterpretation(
    grade,
    classification
) {

    /*
       -------------------------------------------------------
       INVALID / UNAVAILABLE RESULT
       -------------------------------------------------------
    */

    if (
        !grade ||
        grade === "—" ||
        grade === "Not available"
    ) {

        return "SPM interpretation is not available.";
    }


    /*
       -------------------------------------------------------
       GRADE I / II+ / II
       ABOVE-AVERAGE PERFORMANCE
       -------------------------------------------------------
    */

    if (
        grade === "Grade I" ||
        grade === "Grade II+" ||
        grade === "Grade II"
    ) {

        return (
            "The child's performance on Raven's Standard Progressive Matrices " +
            "indicates non-verbal reasoning and clear-thinking ability that is " +
            "above the expected level for the comparative age group. The performance " +
            "suggests comparatively well-developed ability to identify visual " +
            "relationships, recognize patterns, integrate visual information, " +
            "and determine the missing element within logical sequences. " +
            "These abilities support efficient non-verbal problem solving, " +
            "visual reasoning and abstract reasoning in situations where verbal " +
            "expression is less directly involved."
        );
    }


    /*
       -------------------------------------------------------
       GRADE III / III+ / III−
       AVERAGE PERFORMANCE
       -------------------------------------------------------
    */

    if (
        grade === "Grade III" ||
        grade === "Grade III+" ||
        grade === "Grade III−" ||
        grade === "Grade III-"
    ) {

        let medianDescription = "";


        if (
            grade === "Grade III+"
        ) {

            medianDescription =
                "The performance is above the median within the age-based normative group.";

        } else if (
            grade === "Grade III−" ||
            grade === "Grade III-"
        ) {

            medianDescription =
                "The performance is below the median while remaining within the intellectually average range.";

        } else {

            medianDescription =
                "The performance falls within the intellectually average range for the age group.";
        }


        return (
            "The child's performance on Raven's Standard Progressive Matrices " +
            "indicates broadly age-appropriate non-verbal reasoning and clear-thinking " +
            "ability relative to the comparative age group. " +
            medianDescription + " " +
            "The performance suggests broadly age-appropriate ability to identify " +
            "visual relationships, recognize patterns, integrate visual information, " +
            "and determine the missing element within logical sequences. " +
            "These skills contribute to non-verbal problem solving and reasoning " +
            "in situations where verbal expression is less directly involved."
        );
    }


    /*
       -------------------------------------------------------
       GRADE IV / IV−
       BELOW-AVERAGE PERFORMANCE
       -------------------------------------------------------
    */

    if (
        grade === "Grade IV" ||
        grade === "Grade IV−" ||
        grade === "Grade IV-"
    ) {

        return (
            "The child's performance on Raven's Standard Progressive Matrices " +
            "indicates comparatively lower non-verbal reasoning and clear-thinking " +
            "performance relative to the comparative age group. The result may " +
            "reflect greater difficulty, relative to age peers, in identifying " +
            "visual relationships, recognizing patterns, integrating visual " +
            "information, and determining the missing element within logical " +
            "sequences. These findings suggest relative difficulty in aspects " +
            "of non-verbal reasoning and visual problem solving and may benefit " +
            "from targeted educational or developmental support. The finding " +
            "should be considered together with the child's academic functioning, " +
            "developmental history, behavioural observations and other assessment findings."
        );
    }


    /*
       -------------------------------------------------------
       GRADE V
       VERY LOW PERFORMANCE
       -------------------------------------------------------
    */

    if (
        grade === "Grade V"
    ) {

        return (
            "The child's performance on Raven's Standard Progressive Matrices " +
            "falls substantially below the expected range for the comparative age " +
            "group. This pattern suggests significant difficulty, relative to age " +
            "peers, with non-verbal reasoning processes involved in identifying " +
            "visual relationships, recognizing patterns, integrating visual " +
            "information, and determining the missing element within logical " +
            "sequences. The finding warrants consideration of targeted educational " +
            "or developmental support and further evaluation of the child's broader " +
            "cognitive, academic, developmental and functional profile. " +
            "The SPM result should not be interpreted in isolation as establishing " +
            "a diagnosis of intellectual disability."
        );
    }


    /*
       -------------------------------------------------------
       FALLBACK
       -------------------------------------------------------
    */

    return (
        "The SPM result should be interpreted with reference to the child's " +
        "age-specific normative performance and in conjunction with the broader " +
        "developmental, academic and functional profile."
    );
}



/* =========================================================
   SNAP-IV SCORING
   ========================================================= */

function snapMean(
    score,
    numberOfItems
) {

    return score /
        numberOfItems;
}


function snapSeverity(
    score,
    domain
) {

    if (
        domain === "inattention"
    ) {

        if (score < 13)
            return "Symptoms not clinically significant";

        if (score <= 17)
            return "Mild symptoms";

        if (score <= 22)
            return "Moderate symptoms";

        return "Severe symptoms";
    }


    if (
        domain === "hyperactivity"
    ) {

        if (score < 13)
            return "Symptoms not clinically significant";

        if (score <= 17)
            return "Mild symptoms";

        if (score <= 22)
            return "Moderate symptoms";

        return "Severe symptoms";
    }


    if (
        domain === "opposition"
    ) {

        if (score < 8)
            return "Symptoms not clinically significant";

        if (score <= 13)
            return "Mild symptoms";

        if (score <= 18)
            return "Moderate symptoms";

        return "Severe symptoms";
    }


    return "—";
}


function snapElevated(
    score,
    domain
) {

    if (
        domain === "inattention" ||
        domain === "hyperactivity"
    ) {

        return score >= 13;
    }


    if (
        domain === "opposition"
    ) {

        return score >= 8;
    }


    return false;
}


function determineSNAPProfile(
    inattention,
    hyperactivity,
    opposition
) {

    const I =
        snapElevated(
            inattention,
            "inattention"
        );

    const H =
        snapElevated(
            hyperactivity,
            "hyperactivity"
        );

    const O =
        snapElevated(
            opposition,
            "opposition"
        );


    if (!I && !H && !O)
        return "NONE";


    if (I && H && O)
        return "COMBINED_ADHD_ODD";


    if (I && H)
        return "COMBINED_ADHD";


    if (I && O)
        return "INATTENTION_ODD";


    if (H && O)
        return "HYPERACTIVITY_ODD";


    if (I)
        return "INATTENTION";


    if (H)
        return "HYPERACTIVITY";


    if (O)
        return "ODD";


    return "NONE";
}

/* =========================================================
   SNAP-IV INTERPRETATION
   ========================================================= */

function getSNAPInterpretation(
    snap
) {

    if (!snap) {

        return {
            summary:
                "SNAP-IV results were not available.",

            interpretation:
                "No SNAP-IV interpretation can be generated.",

            risk:
                false
        };
    }


    const {
        inattention,
        hyperactivity,
        opposition
    } = snap;


    const I =
        snapElevated(
            inattention,
            "inattention"
        );

    const H =
        snapElevated(
            hyperactivity,
            "hyperactivity"
        );

    const O =
        snapElevated(
            opposition,
            "opposition"
        );


    /*
       No elevated domain
    */

    if (!I && !H && !O) {

        return {

            summary:
                "No SNAP-IV domain is elevated above the configured clinical significance threshold.",

            interpretation:
                "The SNAP-IV domain scores do not indicate clinically significant elevation on the present screening measure. These findings should nevertheless be considered alongside the child's developmental, academic, behavioural and functional history.",

            risk:
                false
        };
    }


    /*
       Isolated Opposition / Defiance
    */

    if (
        O &&
        !I &&
        !H
    ) {

        return {

            summary:
                "Opposition/Defiance is elevated, while Inattention and Hyperactivity/Impulsivity are not elevated.",

            interpretation:
                "Although the elevation is isolated to the Opposition/Defiance subscale, an elevated score in any SNAP-IV domain indicates a potential risk for ADHD. Therefore, further diagnostic assessment is required to definitively rule out ADHD.",

            risk:
                true
        };
    }


    /*
       Inattention and/or Hyperactivity elevated
    */

    return {

        summary:
            "One or more ADHD-related SNAP-IV domains are elevated.",

        interpretation:
            "The elevated SNAP-IV scores indicate a potential risk for ADHD. Therefore, further diagnostic assessment is required to definitively rule out ADHD.",

        risk:
            true
    };
}


/* =========================================================
   SNAP-IV RECOMMENDATIONS
   ========================================================= */

function getSNAPRecommendations(
    snap
) {

    if (!snap) {
        return [];
    }


    const interpretation =
        getSNAPInterpretation(
            snap
        );


    if (!interpretation.risk) {

        return [
            "Continue to monitor the child's academic, behavioural and social functioning.",
            "If concerns persist or increase, a comprehensive psychological assessment may be considered."
        ];
    }


    return [

        "A comprehensive psychological assessment is recommended. Kindly consult a nearby Rehabilitation Psychologist or Clinical Psychologist, or visit Little Stars & She (Kondapur) or NIEPID, Secunderabad, for further evaluation.",

        "It is recommended to implement Positive Behavior Support (PBS) strategies to address behavioral challenges, promote self-regulation, and enhance compliance and overall school functioning."

    ];
}


/* =========================================================
   CALCULATE SNAP-IV
   ========================================================= */

function calculateSNAP() {

    const inattentionElement =
        $("snapInattention");

    const hyperactivityElement =
        $("snapHyperactivity");

    const oppositionElement =
        $("snapOpposition");


    if (
        !inattentionElement ||
        !hyperactivityElement ||
        !oppositionElement
    ) {

        assessment.snapData = null;

        return null;
    }


    const inattention =
        Number(
            inattentionElement.value
        );

    const hyperactivity =
        Number(
            hyperactivityElement.value
        );

    const opposition =
        Number(
            oppositionElement.value
        );


    if (
        !Number.isInteger(inattention) ||
        inattention < 0 ||
        inattention > 27
    ) {

        assessment.snapData = {
            valid: false,
            error:
                "SNAP-IV Inattention score must be an integer between 0 and 27."
        };

        return assessment.snapData;
    }


    if (
        !Number.isInteger(hyperactivity) ||
        hyperactivity < 0 ||
        hyperactivity > 27
    ) {

        assessment.snapData = {
            valid: false,
            error:
                "SNAP-IV Hyperactivity/Impulsivity score must be an integer between 0 and 27."
        };

        return assessment.snapData;
    }


    if (
        !Number.isInteger(opposition) ||
        opposition < 0 ||
        opposition > 24
    ) {

        assessment.snapData = {
            valid: false,
            error:
                "SNAP-IV Opposition/Defiance score must be an integer between 0 and 24."
        };

        return assessment.snapData;
    }


    const result = {

        valid:
            true,

        inattention,

        hyperactivity,

        opposition,

        inattentionMean:
            snapMean(
                inattention,
                9
            ),

        hyperactivityMean:
            snapMean(
                hyperactivity,
                9
            ),

        oppositionMean:
            snapMean(
                opposition,
                8
            ),

        inattentionSeverity:
            snapSeverity(
                inattention,
                "inattention"
            ),

        hyperactivitySeverity:
            snapSeverity(
                hyperactivity,
                "hyperactivity"
            ),

        oppositionSeverity:
            snapSeverity(
                opposition,
                "opposition"
            ),

        inattentionElevated:
            snapElevated(
                inattention,
                "inattention"
            ),

        hyperactivityElevated:
            snapElevated(
                hyperactivity,
                "hyperactivity"
            ),

        oppositionElevated:
            snapElevated(
                opposition,
                "opposition"
            )
    };


    result.profile =
        determineSNAPProfile(
            inattention,
            hyperactivity,
            opposition
        );


    const interpretation =
        getSNAPInterpretation(
            result
        );


    result.summary =
        interpretation.summary;

    result.interpretation =
        interpretation.interpretation;

    result.risk =
        interpretation.risk;


    result.recommendations =
        getSNAPRecommendations(
            result
        );


    assessment.snapData =
        result;


    return result;
}


/* =========================================================
   SLD SCREENING
   ========================================================= */

function readSLDScreening() {

    assessment.sldScreened =
        $("sldScreened")
            ? $("sldScreened").checked
            : false;

    return assessment.sldScreened;
}


/* =========================================================
   MAIN CALCULATION
   ========================================================= */

function calculateAssessment() {

    /*
       Always capture the latest form values
       before calculating the assessment.
    */

    readChildInformation();

    readInstrumentSelection();

    assessment.sldScreened =
        $("sldScreened")
            ? $("sldScreened").checked
            : false;


    /* =========================================
       CPM
       ========================================= */

    assessment.cpm = null;

    if (
        assessment.matrix === "CPM"
    ) {

        const age =
            getAgeFromFields(
                "cpm"
            );

        const scoreElement =
            $("cpmScore");

        const score =
            scoreElement &&
            scoreElement.value !== ""
                ? Number(scoreElement.value)
                : null;


        if (
            age &&
            Number.isInteger(score)
        ) {

            assessment.cpm =
                classifyCPM(
                    age,
                    score
                );

        } else {

            assessment.cpm = {

                valid:
                    false,

                classification:
                    "Score Not Classified",

                standardScore:
                    "—",

                percentile:
                    null,

                percentileText:
                    "—",

                interpretation:
                    "Please enter a valid CPM age and raw score."
            };
        }
    }


    /* =========================================
       SPM
       ========================================= */

    assessment.spm = null;

    if (
        assessment.matrix === "SPM"
    ) {

        const age =
            getAgeFromFields(
                "spm"
            );

        const scoreElement =
            $("spmScore");

        const score =
            scoreElement &&
            scoreElement.value !== ""
                ? Number(scoreElement.value)
                : null;


        if (
            age &&
            Number.isInteger(score)
        ) {

            assessment.spm =
                classifySPM(
                    age,
                    score
                );

        } else {

            assessment.spm = {

                valid:
                    false,

                grade:
                    "—",

                percentile:
                    "—",

                classification:
                    "Score Not Classified",

                interpretation:
                    "Please enter a valid SPM age and raw score."
            };
        }
    }


    /* =========================================
       SNAP-IV
       ========================================= */

    assessment.snapData = null;

    if (
        assessment.snap
    ) {

        calculateSNAP();
    }


  /*
   Save age information for the child summary.
*/

if (
    assessment.matrix === "CPM"
) {

    const age =
        getAgeFromFields(
            "cpm"
        );

    if (age) {

        assessment.child.ageYears =
            age.years;

        assessment.child.ageMonths =
            age.months;
    }

} else if (
    assessment.matrix === "SPM"
) {

    const age =
        getAgeFromFields(
            "spm"
        );

    if (age) {

        assessment.child.ageYears =
            age.years;

        assessment.child.ageMonths =
            age.months;
    }

} else if (
    assessment.snap
) {

    const age =
        getAgeFromFields(
            "snap"
        );

    if (age) {

        assessment.child.ageYears =
            age.years;

        assessment.child.ageMonths =
            age.months;
    }
}
    return assessment;
}


/* =========================================================
   VALIDATION
   ========================================================= */

function assessmentIsValid() {

    readChildInformation();

    readInstrumentSelection();

    readSLDScreening();

    /*
       Child information
    */

    if (
        !assessment.child.name
    ) {

        showMessage(
            "Please enter the child's name."
        );

        return false;
    }


    if (
        !assessment.child.uid
    ) {

        showMessage(
            "Please enter the UID / Case ID."
        );

        return false;
    }


    if (
        !assessment.child.class
    ) {

        showMessage(
            "Please enter the child's class."
        );

        return false;
    }


    if (
        !assessment.child.school
    ) {

        showMessage(
            "Please enter the school name."
        );

        return false;
    }


    if (
        !assessment.child.gender
    ) {

        showMessage(
            "Please select gender."
        );

        return false;
    }


    if (
        !assessment.child.assessmentDate
    ) {

        showMessage(
            "Please enter the assessment date."
        );

        return false;
    }


    const dateCheck =
        validateAssessmentDate(
            assessment.child.assessmentDate
        );


    if (
        !dateCheck.valid
    ) {

        showMessage(
            dateCheck.message
        );

        return false;
    }


    /*
       Instrument selection
    */

    if (
        !assessment.matrix &&
        !assessment.snap
    ) {

        showMessage(
            "Please select at least one assessment instrument."
        );

        return false;
    }


    /*
       CPM validation
    */

    if (
        assessment.matrix === "CPM"
    ) {

        const age =
            getAgeFromFields(
                "cpm"
            );

        const scoreElement =
            $("cpmScore");


        if (!age) {

            showMessage(
                "Please enter the CPM age."
            );

            return false;
        }


        if (
            !scoreElement ||
            scoreElement.value === ""
        ) {

            showMessage(
                "Please enter the CPM raw score."
            );

            return false;
        }


        const score =
            Number(
                scoreElement.value
            );


        if (
            !Number.isInteger(score) ||
            score < 0 ||
            score > 36
        ) {

            showMessage(
                "CPM raw score must be an integer between 0 and 36."
            );

            return false;
        }


        if (
            !assessment.cpm ||
            !assessment.cpm.valid
        ) {

            showMessage(
                assessment.cpm?.interpretation ||
                "The CPM score could not be classified using the configured norms."
            );

            return false;
        }
    }


    /*
       SPM validation
    */

    if (
        assessment.matrix === "SPM"
    ) {

        const age =
            getAgeFromFields(
                "spm"
            );

        const scoreElement =
            $("spmScore");


        if (!age) {

            showMessage(
                "Please enter the SPM age."
            );

            return false;
        }


        if (
            !scoreElement ||
            scoreElement.value === ""
        ) {

            showMessage(
                "Please enter the SPM raw score."
            );

            return false;
        }


        const score =
            Number(
                scoreElement.value
            );


        if (
            !Number.isInteger(score) ||
            score < 0 ||
            score > 60
        ) {

            showMessage(
                "SPM raw score must be an integer between 0 and 60."
            );

            return false;
        }


        if (
            !assessment.spm ||
            !assessment.spm.valid
        ) {

            showMessage(
                assessment.spm?.interpretation ||
                "The SPM score could not be classified using the configured norms."
            );

            return false;
        }
    }


    /*
       SNAP-IV validation
    */

    if (
        assessment.snap
    ) {

        const snap =
            assessment.snapData ||
            calculateSNAP();


        if (
            !snap ||
            !snap.valid
        ) {

            showMessage(
                snap?.error ||
                "Please enter valid SNAP-IV domain scores."
            );

            return false;
        }
    }


    return true;
}


/* =========================================================
   FORMAT HELPERS
   ========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function safeValue(
    value,
    fallback = "—"
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return fallback;
    }

    return escapeHTML(
        value
    );
}


function formatDate(
    value
) {

    if (!value) {
        return "—";
    }

    const date =
        parseDateInput(
            value
        );

    if (!date) {
        return escapeHTML(value);
    }

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const year =
        date.getFullYear();

    return `${day}-${month}-${year}`;
}


/* =========================================================
   REPORT HEADER
   ========================================================= */
/* =========================================================
   REPORT HEADER + A4 REPORT LAYOUT
   ========================================================= */

/* =========================================================
   PROFESSIONAL REPORT HEADER + REPORT STYLE
   ========================================================= */

function getReportHeader() {

    return `

    <style>

        /*
         * =====================================================
         * REPORT COLOUR PALETTE
         * =====================================================
         */

        .print-report {

            --report-dark-blue:
                #17365D;

            --report-blue:
                #2F5597;

            --report-light-blue:
                #D9EAF7;

            --report-pale-blue:
                #EEF5FB;

            --report-border-blue:
                #8FAFC9;

            --report-text:
                #243447;

            --report-muted:
                #52677A;
        }


        /*
         * =====================================================
         * MAIN REPORT
         * =====================================================
         */

        .print-report {

            width:
                100% !important;

            max-width:
                210mm !important;

            margin:
                0 auto !important;

            padding:
                14mm 15mm 16mm 15mm !important;

            box-sizing:
                border-box !important;

            background:
                #FFFFFF !important;

            color:
                #243447 !important;

            font-family:
                "Times New Roman",
                Times,
                serif !important;

            font-size:
                11pt !important;

            line-height:
                1.45 !important;

            text-align:
                left;
        }


        /*
         * =====================================================
         * ALL REPORT TEXT
         * =====================================================
         */

        .print-report * {

            font-family:
                "Times New Roman",
                Times,
                serif !important;

            box-sizing:
                border-box;
        }


        .print-report p,

        .print-report li,

        .print-report td,

        .print-report th,

        .print-report div,

        .print-report span {

            color:
                #243447 !important;
        }


        /*
         * =====================================================
         * HEADER
         * =====================================================
         */

        .print-report .report-header {

            width:
                100%;

            text-align:
                center;

            margin:
                0 0 7mm 0;

            padding:
                0 0 5mm 0;

            border-bottom:
                2px solid #2F5597;
        }


        /*
         * LOGO
         * =====================================================
         */

        .print-report .report-logo {

            width:
                100%;

            text-align:
                center;

            margin:
                0 0 4mm 0;
        }


        .print-report .report-logo img {

            display:
                block;

            width:
                220px;

            max-width:
                60%;

            height:
                auto;

            margin:
                0 auto;
        }


        /*
         * =====================================================
         * MAIN TITLE
         * =====================================================
         */

        .print-report .report-title {

            width:
                100%;

            text-align:
                center;
        }


        .print-report .report-title h1 {

            margin:
                0;

            padding:
                0;

            color:
                #17365D !important;

            font-family:
                "Times New Roman",
                Times,
                serif !important;

            font-size:
                18pt;

            font-weight:
                700;

            line-height:
                1.2;

            letter-spacing:
                0.3px;
        }


        .print-report .report-title p {

            margin:
                2mm 0 0 0;

            color:
                #2F5597 !important;

            font-size:
                11.5pt;

            font-weight:
                600;
        }


        /*
         * =====================================================
         * SECTION HEADINGS
         * =====================================================
         */

        .print-report h2,

        .print-report .report-section-title {

            margin:
                6mm 0 3mm 0;

            padding:
                2mm 3mm;

            color:
                #17365D !important;

            background:
                #EEF5FB !important;

            border-left:
                4px solid #2F5597;

            border-bottom:
                1px solid #8FAFC9;

            font-family:
                "Times New Roman",
                Times,
                serif !important;

            font-size:
                12pt;

            font-weight:
                700;

            text-transform:
                uppercase;

            line-height:
                1.25;
        }


        /*
         * =====================================================
         * NORMAL REPORT SECTIONS
         * =====================================================
         */

        .print-report .report-section {

            width:
                100%;

            max-width:
                100%;

            margin:
                0 0 5mm 0;

            padding:
                0;

            page-break-inside:
                auto;
        }


        /*
         * =====================================================
         * TABLES
         * =====================================================
         */

        .print-report table {

            width:
                100% !important;

            max-width:
                100% !important;

            border-collapse:
                collapse;

            table-layout:
                fixed;

            margin:
                0 0 5mm 0;

            color:
                #243447 !important;

            background:
                #FFFFFF;
        }


        .print-report th,

        .print-report td {

            padding:
                2.2mm 2.5mm;

            border:
                1px solid #8FAFC9 !important;

            vertical-align:
                top;

            word-wrap:
                break-word;

            overflow-wrap:
                anywhere;

            color:
                #243447 !important;
        }


        /*
         * =====================================================
         * TABLE HEADINGS
         * =====================================================
         */

        .print-report th {

            background:
                #D9EAF7 !important;

            color:
                #17365D !important;

            font-weight:
                700;

            text-align:
                left;
        }


        /*
         * =====================================================
         * RESULT TABLE
         * =====================================================
         */

        .print-report .result-table {

            width:
                100% !important;

            table-layout:
                fixed;
        }


        .print-report .result-table th {

            background:
                #2F5597 !important;

            color:
                #FFFFFF !important;

            text-align:
                center;
        }


        .print-report .result-table td {

            text-align:
                center;

            background:
                #FFFFFF !important;
        }


        /*
         * =====================================================
         * INTERPRETATION BOX
         * =====================================================
         */

        .print-report .interpretation-box {

            margin:
                4mm 0 5mm 0;

            padding:
                4mm 5mm;

            background:
                #F4F8FC !important;

            border-left:
                4px solid #2F5597;

            border-top:
                1px solid #C3D5E5;

            border-right:
                1px solid #C3D5E5;

            border-bottom:
                1px solid #C3D5E5;
        }


        .print-report .interpretation-box h3 {

            margin:
                0 0 2mm 0;

            color:
                #17365D !important;

            font-size:
                11pt;

            font-weight:
                700;
        }


        .print-report .interpretation-box p {

            margin:
                0;

            color:
                #243447 !important;
        }


        /*
         * =====================================================
         * LISTS
         * =====================================================
         */

        .print-report ul,

        .print-report ol {

            margin-top:
                2mm;

            margin-bottom:
                4mm;

            padding-left:
                7mm;
        }


        .print-report li {

            margin-bottom:
                1.5mm;

            color:
                #243447 !important;
        }


        /*
         * =====================================================
         * SIGNATURE AREA
         * =====================================================
         */

        .print-report .signature-table,

        .print-report .report-signature-table {

            width:
                100% !important;

            border:
                none !important;

            table-layout:
                fixed;

           margin-top: 3mm;
        }


        .print-report .signature-table td,
.print-report .report-signature-table td {
    width: 50% !important;
    border: none !important;
    background: #FFFFFF !important;
    padding: 0 8mm 0 0 !important;
    vertical-align: top !important;
    text-align: left !important;
}


        /*
         * =====================================================
         * DISCLAIMER
         * =====================================================
         */

        .print-report .disclaimer,

        .print-report .report-disclaimer {

            margin-top:
                6mm;

            padding-top:
                4mm;

            border-top:
                1px solid #8FAFC9;

            color:
                #52677A !important;

            font-size:
                9pt;

            line-height:
                1.4;

            font-style:
                italic;
        }


        /*
         * =====================================================
         * FOOTER
         * =====================================================
         */

        .print-report .report-footer {

            width:
                100%;

            margin-top:
                8mm;

            padding-top:
                3mm;

            border-top:
                2px solid #2F5597;

            text-align:
                center;

            color:
                #17365D !important;

            font-size:
                9pt;
        }


        .print-report .report-footer p {

            margin:
                1mm 0;

            color:
                #17365D !important;
        }


        /*
         * =====================================================
         * SCREEN PREVIEW
         * =====================================================
         */

        @media screen {

            .print-report {

                margin-left:
                    auto !important;

                margin-right:
                    auto !important;

                box-shadow:
                    0 3px 18px
                    rgba(23, 54, 93, 0.16);

                border:
                    1px solid #D5E1EC;
            }
        }


        /*
         * =====================================================
         * PRINT / PDF
         * =====================================================
         */

        @media print {

            @page {

                size:
                    A4 portrait;

                margin:
                    0;
            }


            html,

            body {

                margin:
                    0 !important;

                padding:
                    0 !important;

                width:
                    210mm !important;

                background:
                    #FFFFFF !important;
            }


            .print-report {

                width:
                    210mm !important;

                max-width:
                    210mm !important;

                min-height:
                    297mm;

                margin:
                    0 !important;

                padding:
                    14mm 15mm 16mm 15mm !important;

                box-shadow:
                    none !important;

                border:
                    none !important;

                background:
                    #FFFFFF !important;

                color:
                    #243447 !important;

                font-family:
                    "Times New Roman",
                    Times,
                    serif !important;

                overflow:
                    visible !important;
            }


            .print-report * {

                font-family:
                    "Times New Roman",
                    Times,
                    serif !important;
            }


            .report-toolbar,

            .report-actions {

                display:
                    none !important;
            }


            .print-report table {

                width:
                    100% !important;

                max-width:
                    100% !important;
            }
        }

    </style>


    <div class="report-header">

        <div class="report-logo">

            <img
                src="${REPORT_LOGO}"
                alt="Choice Foundation"
                onerror="this.style.display='none';"
            >

        </div>


        <div class="report-title">

            <h1>
                PSYCHOLOGICAL SCREENING &amp;
                ASSESSMENT REPORT
            </h1>

           

        </div>

    </div>

    `;
}
/* =========================================================
   CHILD INFORMATION SECTION
   ========================================================= */

function getChildInformationSection() {

    const child =
        assessment.child || {};


    /*
       Make sure the child's chronological age
       is available for the final report.

       CPM and SPM store age in their respective
       score fields, so retrieve it again here
       immediately before the report is created.
    */

    let ageYears =
        child.ageYears;

    let ageMonths =
        child.ageMonths;


    /*
       First try the currently selected matrix.
    */

    if (
        assessment.matrix === "CPM"
    ) {

        const age =
            getAgeFromFields("cpm");

        if (age) {

            ageYears =
                age.years;

            ageMonths =
                age.months;

        }

    }

    else if (
        assessment.matrix === "SPM"
    ) {

        const age =
            getAgeFromFields("spm");

        if (age) {

            ageYears =
                age.years;

            ageMonths =
                age.months;

        }

    }


    /*
       If the matrix is not available for some reason,
       try CPM and then SPM as a fallback.
    */

    if (
        ageYears === undefined ||
        ageYears === null ||
        ageYears === "" ||
        ageMonths === undefined ||
        ageMonths === null ||
        ageMonths === ""
    ) {

        const cpmAge =
            getAgeFromFields("cpm");

        if (cpmAge) {

            ageYears =
                cpmAge.years;

            ageMonths =
                cpmAge.months;

        }

    }


    if (
        ageYears === undefined ||
        ageYears === null ||
        ageYears === "" ||
        ageMonths === undefined ||
        ageMonths === null ||
        ageMonths === ""
    ) {

        const spmAge =
            getAgeFromFields("spm");

        if (spmAge) {

            ageYears =
                spmAge.years;

            ageMonths =
                spmAge.months;

        }

    }


    /*
       Final age text used in the PDF.
    */

    const age =
        (
            ageYears !== undefined &&
            ageYears !== null &&
            ageYears !== "" &&
            ageMonths !== undefined &&
            ageMonths !== null &&
            ageMonths !== ""
        )
            ? `${ageYears} years ${ageMonths} months`
            : "—";


    /*
       Keep the application state synchronized
       with what is actually displayed in the report.
    */

    assessment.child.ageYears =
        ageYears ?? "";

    assessment.child.ageMonths =
        ageMonths ?? "";


    return `

    <section class="report-section">

        <div class="report-section-title">
            Child Information
        </div>


        <table class="report-table">

            <tr>

                <th>Child Name</th>
                <td>${safeValue(child.name)}</td>

                <th>UID / Case ID</th>
                <td>${safeValue(child.uid)}</td>

            </tr>


            <tr>

                <th>Class</th>
                <td>${safeValue(child.class)}</td>

                <th>Gender</th>
                <td>${safeValue(child.gender)}</td>

            </tr>


            <tr>

                <th>School</th>
                <td>${safeValue(child.school)}</td>

                <th>Age</th>
                <td>${safeValue(age)}</td>

            </tr>


            <tr>

                <th>Assessment Date</th>

                <td colspan="3">
                    ${formatDate(child.assessmentDate)}
                </td>

            </tr>

        </table>

    </section>

    `;
}


/* =========================================================
   TESTS CONDUCTED
   ========================================================= */

function getTestsConductedSection() {

    const tests = [];


    if (
        assessment.matrix === "CPM"
    ) {

        tests.push(
            "Raven's Coloured Progressive Matrices (CPM)"
        );
    }


    if (
        assessment.matrix === "SPM"
    ) {

        tests.push(
            "Raven's Standard Progressive Matrices (SPM)"
        );
    }


    if (
        assessment.snap
    ) {

        tests.push(
            "Swanson, Nolan, and Pelham Rating Scale – IV(SNAP-IV)"
        );
    }


    if (
        assessment.sldScreened
    ) {

        tests.push(
            "Specific Learning Disability (SLD) Screening"
        );
    }


    return `

    <section class="report-section">

        <div class="report-section-title">
            Tests / Screening Measures Conducted
        </div>


        <ul class="report-list">

            ${
                tests.length
                    ? tests
                        .map(
                            test =>
                                `<li>${escapeHTML(test)}</li>`
                        )
                        .join("")
                    : "<li>None</li>"
            }

        </ul>

    </section>

    `;
}

/* =========================================================
   CPM REPORT SECTION
   ========================================================= */

function getCPMReportSection() {

    const c =
        assessment.cpm;


    /*
       If CPM was not selected or could not be
       calculated, simply do not add a CPM section.
       This prevents the report from crashing.
    */

    if (
        !c ||
        !c.valid
    ) {

        return "";
    }


    return `

        <section class="report-section">

            <h2>
                Raven's Coloured Progressive Matrices (CPM)
            </h2>


            <table class="result-table">

                <thead>

                    <tr>

                        <th>
                            Raw Score
                        </th>

                        <th>
                            Standard Score
                        </th>

                        <th>
                            Percentile
                        </th>

                        <th>
                            Grade
                        </th>

                        <th>
                            Classification
                        </th>

                    </tr>

                </thead>


                <tbody>

                    <tr>

                        <td>
                            ${safeValue(c.score)}
                        </td>

                        <td>
                            ${safeValue(c.standardScore)}
                        </td>

                        <td>
                            ${safeValue(c.percentileText)}
                        </td>

                        <td>
                            ${safeValue(c.grade)}
                        </td>

                        <td>
                            ${safeValue(c.classification)}
                        </td>

                    </tr>

                </tbody>

            </table>


            <div class="interpretation-box">

                <h3>
                    Interpretation
                </h3>

                <p>
                    ${safeValue(c.interpretation)}
                </p>

            </div>

        </section>

    `;
}


/* =========================================================
   SPM REPORT SECTION
   ========================================================= */

function getSPMReportSection() {

    const s =
        assessment.spm;


    /*
       If SPM was not selected or could not be
       calculated, return an empty section.
    */

    if (
        !s ||
        !s.valid
    ) {

        return "";
    }


    return `

        <section class="report-section">

            <h2>
                Raven's Standard Progressive Matrices (SPM)
            </h2>


            <table class="result-table">

                <thead>

                    <tr>

                        <th>
                            Raw Score
                        </th>

                        <th>
                            Percentile Band
                        </th>

                        <th>
                            Grade
                        </th>

                        <th>
                            Classification
                        </th>

                    </tr>

                </thead>


                <tbody>

                    <tr>

                        <td>
                            ${safeValue(s.score)}
                        </td>

                        <td>
                            ${safeValue(s.percentile)}
                        </td>

                        <td>
                            ${safeValue(s.grade)}
                        </td>

                        <td>
                            ${safeValue(s.classification)}
                        </td>

                    </tr>

                </tbody>

            </table>


            <div class="interpretation-box">

                <h3>
                    Interpretation
                </h3>

                <p>
                    ${safeValue(s.interpretation)}
                </p>

            </div>

        </section>

    `;
}


/* =========================================================
   SNAP-IV REPORT SECTION
   ========================================================= */

function getSNAPReportSection() {

    const s =
        assessment.snapData;


    /*
       SNAP-IV is optional.
       If it was not selected, don't create a section.
    */

    if (
        !s ||
        !s.valid
    ) {

        return "";
    }


    return `

        <section class="report-section">

            <h2>
                Swanson, Nolan, and Pelham Rating Scale(SNAP-IV)
            </h2>


            <table class="result-table">

                <thead>

                    <tr>

                        <th>
                            Domain
                        </th>

                        <th>
                            Raw Score
                        </th>

                        <th>
                            Severity
                        </th>

                    </tr>

                </thead>


                <tbody>

                    <tr>

                        <td>
                            Inattention
                        </td>

                        <td>
                            ${safeValue(s.inattention)} / 27
                        </td>

                        <td>
                            ${safeValue(s.inattentionSeverity)}
                        </td>

                    </tr>


                    <tr>

                        <td>
                            Hyperactivity / Impulsivity
                        </td>

                        <td>
                            ${safeValue(s.hyperactivity)} / 27
                        </td>

                        <td>
                            ${safeValue(s.hyperactivitySeverity)}
                        </td>

                    </tr>


                    <tr>

                        <td>
                            Opposition / Defiance
                        </td>

                        <td>
                            ${safeValue(s.opposition)} / 24
                        </td>

                        <td>
                            ${safeValue(s.oppositionSeverity)}
                        </td>

                    </tr>

                </tbody>

            </table>


            <div class="interpretation-box">

                <h3>
                    Interpretation
                </h3>

                <p>
                    ${safeValue(s.interpretation)}
                </p>

            </div>

        </section>

    `;
}


/* =========================================================
   SLD SCREENING NOTE
   ========================================================= */

function getSLDSection() {

    if (
        !assessment.sldScreened
    ) {

        return "";
    }


    return `

        <section class="report-section">

            <h2>
                Academic / Learning Considerations
            </h2>


            <p>

                As reported by the teacher, the student's
                academic difficulties raise concerns regarding
                possible Specific Learning Disorder (SLD) or
                other learning difficulties, warranting
                comprehensive psychological and educational
                assessment.

                It is also important to consider that the
                student previously studied in a Telugu-medium
                school and is currently transitioning to
                English-medium education.

                Difficulties with English language acquisition
                may contribute to the reported academic concerns
                and could also result in elevated scores on
                symptom screening measures.

                Therefore, the findings should be interpreted
                in the context of the student's linguistic and
                educational background.

            </p>

        </section>

    `;
}


/* =========================================================
   IMPRESSION SECTION
   ========================================================= */

function getImpressionSection() {

    return `

        <section class="report-section">

            <h2>
                Clinical Impression
            </h2>


            <p class="impression-text">

                ${safeValue(
                    getIntegratedImpression()
                )}

            </p>

        </section>

    `;
}


/* =========================================================
   UNIFIED RESULTS + CLINICAL NARRATIVE
   ========================================================= */

function getResultsSection() {
    const rows = [];

    if (assessment.cpm?.valid) {
        const c = assessment.cpm;
        const domScore = $("cpmScore")?.value;
        const rawScore =
            c.rawScore !== undefined && c.rawScore !== null && c.rawScore !== ""
                ? c.rawScore
                : c.score !== undefined && c.score !== null && c.score !== ""
                    ? c.score
                    : domScore !== undefined && domScore !== ""
                        ? Number(domScore)
                        : "—";

        const percentile =
            c.percentileText ||
            (c.percentile !== undefined && c.percentile !== null
                ? percentileText(c.percentile)
                : "—");

        rows.push(`
            <tr>
                <td>Raven's Coloured Progressive Matrices (CPM)</td>
                <td>${safeValue(rawScore)}</td>
                <td>${safeValue(c.grade)}<br>Standard Score: ${safeValue(c.standardScore)}<br>${safeValue(percentile)}</td>
                <td>${safeValue(c.classification)}</td>
            </tr>
        `);
    }

    if (assessment.spm?.valid) {
        const s = assessment.spm;
        rows.push(`
            <tr>
                <td>Raven's Standard Progressive Matrices (SPM)</td>
                <td>${safeValue(s.score)}</td>
                <td>${safeValue(s.grade)}<br>${safeValue(s.percentile)}</td>
                <td>${safeValue(s.classification)}</td>
            </tr>
        `);
    }

    if (assessment.snapData?.valid) {
        const s = assessment.snapData;
        const domains = [
            ["SNAP-IV — Inattention", `${safeValue(s.inattention)} / 27`, safeValue(s.inattentionSeverity)],
            ["SNAP-IV — Hyperactivity / Impulsivity", `${safeValue(s.hyperactivity)} / 27`, safeValue(s.hyperactivitySeverity)],
            ["SNAP-IV — Opposition / Defiance", `${safeValue(s.opposition)} / 24`, safeValue(s.oppositionSeverity)]
        ];

        domains.forEach(([assessmentName, score, finding]) => {
            rows.push(`
                <tr>
                    <td>${assessmentName}</td>
                    <td>${score}</td>
                    <td>Domain score</td>
                    <td>${finding}</td>
                </tr>
            `);
        });
    }

    return `
        <section class="report-section">
            <div class="report-section-title">Test Results</div>
            <table class="result-table unified-results-table">
                <thead>
                    <tr>
                        <th>Assessment</th>
                        <th>Score</th>
                        <th>Reference</th>
                        <th>Finding</th>
                    </tr>
                </thead>
                <tbody>${rows.join("")}</tbody>
            </table>
        </section>
    `;
}

function getClinicalNarrativeSection() {
    const statements = [];

    if (assessment.cpm?.valid) {
        const c = assessment.cpm;
        const domScore = $("cpmScore")?.value;
        const rawScore =
            c.rawScore !== undefined && c.rawScore !== null && c.rawScore !== ""
                ? c.rawScore
                : c.score !== undefined && c.score !== null && c.score !== ""
                    ? c.score
                    : domScore !== undefined && domScore !== ""
                        ? Number(domScore)
                        : null;

        const percentile =
            c.percentile !== undefined && c.percentile !== null
                ? Number(c.percentile)
                : null;

        const classificationData = getCPMClassification(percentile);
        const grade = c.grade || classificationData.grade;
        const classification = c.classification || classificationData.classification;
        const standardScore = c.standardScore;
        const percentileDisplay =
            c.percentileText ||
            (Number.isFinite(percentile) ? percentileText(percentile) : "Not available");

        const interpretation = getCPMInterpretation(
            percentile,
            standardScore,
            grade,
            classification
        );

        if (rawScore !== null && rawScore !== undefined) {
            statements.push(interpretation);
        } else {
            statements.push(interpretation);
        }
    }

    if (assessment.spm?.valid) {
        statements.push(assessment.spm.interpretation);
    }

    if (assessment.snapData?.valid) {
        statements.push(assessment.snapData.interpretation);
    }

  if (assessment.sldScreened) {
    statements.push(
        "Based on the concerns reported by the teacher and observations during screening, the student appears to be at risk for learning difficulties, including possible Specific Learning Disability (SLD). It is also noted that the student has recently transitioned from Telugu-medium to English-medium instruction, which may have contributed to academic difficulties and influenced the screening scores. This should be considered while interpreting the findings."
    );
}

statements.push(
    "These findings are screening and assessment observations, not a stand-alone diagnosis. They should be considered alongside developmental history, academic functioning, behavioural observations and relevant contextual information."
);

    return `
        <section class="report-section">
            <div class="report-section-title">Interpretation and Clinical Impression</div>
            <p class="clinical-narrative">${safeValue(statements.filter(Boolean).join(" "))}</p>
        </section>
    `;
}

function getReportVisualOverrides() {


return `
    <style>

    /* =========================================================
       CHOICE FOUNDATION
       PROFESSIONAL A4 REPORT DESIGN
       Presentation / PDF styling only
       ========================================================= */

    .print-report {

        --report-navy: #17365D;
        --report-blue: #2F5597;
        --report-blue-dark: #234A80;
        --report-light-blue: #DCEAF7;
        --report-pale-blue: #F3F7FB;
        --report-border: #9FB6C8;
        --report-text: #1F2933;
        --report-muted: #596773;

        width: 100% !important;
        max-width: 210mm !important;

        margin: 0 auto !important;

        padding: 13mm 15mm 14mm 15mm !important;

        box-sizing: border-box !important;

        background: #FFFFFF !important;

        color: #1F2933 !important;

        font-family:
            "Times New Roman",
            Times,
            serif !important;

        font-size: 10.8pt !important;

        line-height: 1.48 !important;

        text-align: left !important;
    }


    /* =========================================================
       GLOBAL BOX SIZING
       ========================================================= */

    .print-report *,
    .print-report *::before,
    .print-report *::after {

        box-sizing: border-box !important;
    }


    /* =========================================================
       IMPORTANT:
       DO NOT FORCE ONE COLOR ON ALL ELEMENTS.
       This prevents white result-table headings from becoming gray.
       ========================================================= */

    .print-report p,
    .print-report li,
    .print-report td,
    .print-report div,
    .print-report span {

        color: #1F2933;
    }


    /* =========================================================
       HEADER / LETTERHEAD
       ========================================================= */

    .print-report .report-header {

        width: 100% !important;

        margin: 0 0 7mm 0 !important;

        padding: 0 0 5mm 0 !important;

        text-align: center !important;

        border-bottom:
            2.5px solid #2F5597 !important;

        break-inside: avoid !important;

        page-break-inside: avoid !important;
    }


    /* =========================================================
       LOGO
       ========================================================= */

    .print-report .report-logo {

        width: 100% !important;

        margin: 0 0 4mm 0 !important;

        padding: 0 !important;

        text-align: center !important;
    }


    .print-report .report-logo img {

        display: block !important;

        width: 225px !important;

        max-width: 62% !important;

        height: auto !important;

        margin: 0 auto !important;
    }


    /* =========================================================
       REPORT TITLE
       ========================================================= */

    .print-report .report-title {

        width: 100% !important;

        margin: 0 !important;

        padding: 0 !important;

        text-align: center !important;
    }


    .print-report .report-title h1 {

        margin: 0 !important;

        padding: 0 !important;

        color: #17365D !important;

        font-size: 18pt !important;

        font-weight: 700 !important;

        line-height: 1.2 !important;

        letter-spacing: 0.3px !important;

        text-align: center !important;

        text-transform: uppercase !important;
    }


    .print-report .report-title p {

        margin: 1.5mm 0 0 0 !important;

        padding: 0 !important;

        color: #2F5597 !important;

        font-size: 10.5pt !important;

        font-weight: 600 !important;

        text-align: center !important;
    }


    /* =========================================================
       GENERAL REPORT SECTIONS
       ========================================================= */

    .print-report .report-section {

        width: 100% !important;

        max-width: 100% !important;

        margin:
            0 0 5mm 0 !important;

        padding: 0 !important;

        page-break-inside: auto !important;

        break-inside: auto !important;
    }


    /* =========================================================
       ALL MAJOR HEADINGS
       DARK BLUE BACKGROUND + WHITE TEXT
       ========================================================= */

    .print-report h2,
    .print-report .report-section-title {

        display: block !important;

        width: 100% !important;

        margin:
            5mm 0 3mm 0 !important;

        padding:
            2.8mm 4mm !important;

        background:
            #17365D !important;

        color:
            #FFFFFF !important;

        border:
            none !important;

        border-left:
            5px solid #587889 !important;

        border-radius:
            1px !important;

        font-family:
            "Times New Roman",
            Times,
            serif !important;

        font-size:
            11.5pt !important;

        font-weight:
            700 !important;

        line-height:
            1.25 !important;

        letter-spacing:
            0.2px !important;

        text-transform:
            uppercase !important;

        text-align:
            left !important;

        break-after:
            avoid !important;

        page-break-after:
            avoid !important;
    }


    /* =========================================================
       FIRST HEADING AFTER HEADER
       ========================================================= */

    .print-report .report-header
    + .report-section
    .report-section-title {

        margin-top:
            3mm !important;
    }


    /* =========================================================
       GENERAL TABLES
       ========================================================= */

    .print-report table {

        width:
            100% !important;

        max-width:
            100% !important;

        border-collapse:
            collapse !important;

        table-layout:
            fixed !important;

        margin:
            0 0 5mm 0 !important;

        background:
            #FFFFFF !important;
    }


    .print-report th,
    .print-report td {

        padding:
            2.5mm 3mm !important;

        border:
            1px solid #9FB6C8 !important;

        vertical-align:
            middle !important;

        word-wrap:
            break-word !important;

        overflow-wrap:
            break-word !important;

        line-height:
            1.4 !important;
    }


    /* =========================================================
       STANDARD TABLE HEADER
       ========================================================= */

    .print-report th {

        background:
            #DCEAF7 !important;

        color:
            #17365D !important;

        font-weight:
            700 !important;

        text-align:
            left !important;
    }


    .print-report td {

        background:
            #FFFFFF !important;

        color:
            #1F2933 !important;

        text-align:
            left !important;
    }


    /* =========================================================
       CHILD INFORMATION TABLE
       ========================================================= */

    .print-report .report-table th {

        background:
            #DCEAF7 !important;

        color:
            #17365D !important;

        font-weight:
            700 !important;

        text-align:
            left !important;
    }


    .print-report .report-table td {

        background:
            #FFFFFF !important;

        color:
            #1F2933 !important;

        font-weight:
            400 !important;

        text-align:
            left !important;
    }


    /* =========================================================
       TEST RESULTS TABLE
       THIS IS THE IMPORTANT FIX
       ========================================================= */

    .print-report .result-table {

        width:
            100% !important;

        table-layout:
            fixed !important;

        border-collapse:
            collapse !important;

        margin:
            1mm 0 5mm 0 !important;

        break-inside:
            avoid !important;

        page-break-inside:
            avoid !important;
    }


    /* TEST RESULTS HEADER */

    .print-report .result-table th {

        background:
            #2F5597 !important;

        color:
            #FFFFFF !important;

        font-family:
            "Times New Roman",
            Times,
            serif !important;

        font-size:
            10.2pt !important;

        font-weight:
            700 !important;

        text-align:
            center !important;

        vertical-align:
            middle !important;

        padding:
            2.8mm 2.5mm !important;

        border:
            1px solid #234A80 !important;
    }


    /* TEST RESULTS BODY */

    .print-report .result-table td {

        background:
            #FFFFFF !important;

        color:
            #111827 !important;

        font-size:
            10.2pt !important;

        font-weight:
            400 !important;

        text-align:
            center !important;

        vertical-align:
            middle !important;

        padding:
            2.6mm 2.5mm !important;

        border:
            1px solid #9FB6C8 !important;
    }


    /* ALTERNATING RESULT ROWS */

    .print-report .result-table tbody tr:nth-child(even) td {

        background:
            #F7FAFC !important;

        color:
            #111827 !important;
    }


    /* =========================================================
       UNIFIED RESULTS TABLE
       ========================================================= */

    .print-report .unified-results-table {

        width:
            100% !important;

        table-layout:
            fixed !important;

        border-collapse:
            collapse !important;

        break-inside:
            avoid !important;

        page-break-inside:
            avoid !important;
    }


    .print-report .unified-results-table th {

        background:
            #2F5597 !important;

        color:
            #FFFFFF !important;

        font-weight:
            700 !important;

        text-align:
            center !important;

        vertical-align:
            middle !important;
    }


    .print-report .unified-results-table td {

        background:
            #FFFFFF !important;

        color:
            #111827 !important;

        text-align:
            center !important;
    }


    .print-report .unified-results-table tbody tr:nth-child(even) td {

        background:
            #F7FAFC !important;

        color:
            #111827 !important;
    }


    .print-report .unified-results-table th:nth-child(1) {

        width:
            32% !important;
    }


    .print-report .unified-results-table th:nth-child(2) {

        width:
            14% !important;
    }


    .print-report .unified-results-table th:nth-child(3) {

        width:
            27% !important;
    }


    .print-report .unified-results-table th:nth-child(4) {

        width:
            27% !important;
    }


    /* =========================================================
       INTERPRETATION / CLINICAL IMPRESSION
       ========================================================= */

    .print-report .interpretation-box {

        margin:
            3mm 0 5mm 0 !important;

        padding:
            4mm 5mm !important;

        background:
            #F3F7FB !important;

        border:
            1px solid #B7C9D7 !important;

        border-left:
            4px solid #2F5597 !important;

        border-radius:
            1px !important;

        break-inside:
            avoid !important;

        page-break-inside:
            avoid !important;
    }


    .print-report .interpretation-box h3 {

        margin:
            0 0 2mm 0 !important;

        padding:
            0 !important;

        color:
            #17365D !important;

        background:
            transparent !important;

        border:
            none !important;

        font-size:
            10.8pt !important;

        font-weight:
            700 !important;

        line-height:
            1.3 !important;

        text-align:
            left !important;
    }


    .print-report .interpretation-box p {

        margin:
            0 0 2.5mm 0 !important;

        padding:
            0 !important;

        color:
            #1F2933 !important;

        font-size:
            10.5pt !important;

        line-height:
            1.52 !important;

        text-align:
            justify !important;
    }


    /* =========================================================
       CLINICAL NARRATIVE
       ========================================================= */

    .print-report .clinical-narrative {

        margin:
            0 !important;

        padding:
            0 !important;

        color:
            #1F2933 !important;

        font-size:
            10.5pt !important;

        line-height:
            1.52 !important;

        text-align:
            justify !important;
    }


    .print-report .clinical-narrative p {

        margin:
            0 0 2.5mm 0 !important;

        color:
            #1F2933 !important;

        text-align:
            justify !important;
    }


    /* =========================================================
       NORMAL REPORT PARAGRAPHS
       ========================================================= */

    .print-report p {

        margin:
            0 0 2.5mm 0 !important;

        color:
            #1F2933 !important;

        font-size:
            10.5pt !important;

        line-height:
            1.48 !important;

        text-align:
            justify !important;
    }


    /* =========================================================
       LISTS
       ========================================================= */

    .print-report ul,
    .print-report ol {

        margin:
            1.5mm 0 3mm 0 !important;

        padding-left:
            7mm !important;
    }


    .print-report li {

        margin:
            0 0 1.8mm 0 !important;

        padding-left:
            1mm !important;

        color:
            #1F2933 !important;

        font-size:
            10.5pt !important;

        line-height:
            1.45 !important;

        text-align:
            left !important;
    }


    /* =========================================================
       RECOMMENDATIONS
       ========================================================= */

    .print-report .recommendations-list {

        margin:
            2mm 0 3mm 0 !important;

        padding-left:
            7mm !important;
    }


    .print-report .recommendations-list li {

        margin-bottom:
            2mm !important;

        color:
            #1F2933 !important;

        line-height:
            1.48 !important;

        text-align:
            justify !important;
    }


    /* =========================================================
       SIGNATURE AREA
       ========================================================= */

    .print-report .signature-section {

        width:
            100% !important;

        margin-top:
            5mm !important;

        text-align:
            left !important;

        break-inside:
            avoid !important;

        page-break-inside:
            avoid !important;
    }


    .print-report .signature-table {

        width:
            100% !important;

        table-layout:
            fixed !important;

        border-collapse:
            collapse !important;

        border:
            none !important;

        margin:
            3mm 0 0 0 !important;

        break-inside:
            avoid !important;
    }


    .print-report .signature-table td {

        width:
            50% !important;

        border:
            none !important;

        background:
            transparent !important;

        padding:
            0 8mm 0 0 !important;

        vertical-align:
            top !important;

        text-align:
            left !important;

        color:
            #1F2933 !important;

        font-size:
            10pt !important;

        line-height:
            1.45 !important;
    }


    .print-report .signature-table td + td {

        padding-left:
            8mm !important;

        padding-right:
            0 !important;
    }


    .print-report .signature-name {

        display:
            inline-block !important;

        margin-top:
            1.5mm !important;

        color:
            #17365D !important;

        font-weight:
            700 !important;
    }


    .print-report .issued-date {

        margin-top:
            3mm !important;

        color:
            #1F2933 !important;

        font-size:
            9.5pt !important;

        text-align:
            left !important;
    }


    /* =========================================================
       DISCLAIMER
       ========================================================= */

    .print-report .report-disclaimer,
    .print-report .disclaimer {

        margin-top:
            5mm !important;

        padding:
            3.5mm 0 0 0 !important;

        border-top:
            1px solid #A8BBC7 !important;

        color:
            #596773 !important;

        font-size:
            8.8pt !important;

        line-height:
            1.4 !important;

        text-align:
            justify !important;

        font-style:
            normal !important;

        break-inside:
            avoid !important;

        page-break-inside:
            avoid !important;
    }


    .print-report .report-disclaimer strong,
    .print-report .disclaimer strong {

        color:
            #304B5A !important;

        font-weight:
            700 !important;
    }


    /* =========================================================
       CONTACT US
       ========================================================= */

    .print-report .organization-contact {

        width:
            100% !important;

        margin-top:
            3mm !important;

        padding:
            3mm 0 0 0 !important;

        border-top:
            1px solid #A8BBC7 !important;

        color:
            #304B5A !important;

        font-size:
            8.8pt !important;

        line-height:
            1.38 !important;

        text-align:
            center !important;

        break-inside:
            avoid !important;

        page-break-inside:
            avoid !important;
    }


    .print-report .organization-contact strong {

        display:
            block !important;

        margin-bottom:
            1.2mm !important;

        color:
            #17365D !important;

        font-size:
            9.5pt !important;

        font-weight:
            700 !important;

        letter-spacing:
            0.5px !important;

        text-align:
            center !important;
    }


    /* =========================================================
       REPORT FOOTER
       ========================================================= */

    .print-report .report-footer {

        width:
            100% !important;

        margin-top:
            6mm !important;

        padding:
            3mm 0 0 0 !important;

        border-top:
            2px solid #2F5597 !important;

        color:
            #17365D !important;

        font-size:
            8.8pt !important;

        line-height:
            1.35 !important;

        text-align:
            center !important;

        break-inside:
            avoid !important;
    }


    .print-report .report-footer p {

        margin:
            1mm 0 !important;

        color:
            #17365D !important;

        text-align:
            center !important;
    }


    /* =========================================================
       SCREEN PREVIEW
       ========================================================= */

    @media screen {

        .print-report {

            margin-left:
                auto !important;

            margin-right:
                auto !important;

            border:
                1px solid #D5E1EC !important;

            box-shadow:
                0 4px 20px
                rgba(23, 54, 93, 0.15);

            background:
                #FFFFFF !important;
        }
    }


    /* =========================================================
       PRINT / PDF
       ========================================================= */

    @media print {

        @page {

            size:
                A4 portrait;

            margin:
                0;
        }


        html,
        body {

            margin:
                0 !important;

            padding:
                0 !important;

            width:
                auto !important;

            min-width:
                0 !important;

            background:
                #FFFFFF !important;
        }


        .print-report {

            width:
                210mm !important;

            max-width:
                210mm !important;

            min-height:
                0 !important;

            height:
                auto !important;

            margin:
                0 !important;

            padding:
                13mm 15mm 14mm 15mm !important;

            border:
                none !important;

            box-shadow:
                none !important;

            overflow:
                visible !important;

            background:
                #FFFFFF !important;

            color:
                #1F2933 !important;
        }


        /* Keep headings attached to their content */

        .print-report h2,
        .print-report .report-section-title {

            break-before:
                auto !important;

            break-after:
                avoid !important;

            page-break-before:
                auto !important;

            page-break-after:
                avoid !important;
        }


        /* Prevent table rows from splitting */

        .print-report tr {

            break-inside:
                avoid !important;

            page-break-inside:
                avoid !important;
        }


        /* Keep small bottom blocks together */

        .print-report .signature-section,
        .print-report .report-disclaimer,
        .print-report .organization-contact,
        .print-report .report-footer {

            break-inside:
                avoid !important;

            page-break-inside:
                avoid !important;
        }


        /* IMPORTANT:
           Reassert result-table colours during printing */

        .print-report .result-table th {

            background:
                #2F5597 !important;

            color:
                #FFFFFF !important;
        }


        .print-report .result-table td {

            background:
                #FFFFFF !important;

            color:
                #111827 !important;
        }


        .print-report .result-table tbody tr:nth-child(even) td {

            background:
                #F7FAFC !important;

            color:
                #111827 !important;
        }


        .print-report .unified-results-table th {

            background:
                #2F5597 !important;

            color:
                #FFFFFF !important;
        }


        .print-report .unified-results-table td {

            color:
                #111827 !important;
        }


        .report-toolbar,
        .report-actions {

            display:
                none !important;
        }
    }

    </style>
`;


}




/* =========================================================
   RECOMMENDATIONS SECTION
   ========================================================= */

function getRecommendationsSection() {

    const recommendations =
        getIntegratedRecommendations();


    /*
       Always provide an array.
       This prevents .map() from causing
       a blank report if the recommendation
       function returns nothing.
    */

    const list =
        Array.isArray(
            recommendations
        )
            ? recommendations
            : [];


    return `

        <section class="report-section">

            <h2>
                Recommendations
            </h2>


            ${
                list.length > 0

                    ? `

                        <ol class="recommendations-list">

                            ${
                                list
                                    .map(
                                        recommendation =>
                                            `<li>${safeValue(recommendation)}</li>`
                                    )
                                    .join("")
                            }

                        </ol>

                      `

                    : `

                        <p>
                            Continue monitoring the child's
                            academic, behavioural and functional
                            progress. Further assessment may be
                            considered if concerns persist.
                        </p>

                      `
            }

        </section>

    `;
}


/* =========================================================
   DISCLAIMER SECTION
   ========================================================= */
function getDisclaimerSection() {
    return `
        <div class="report-disclaimer disclaimer">
            <strong>Disclaimer:</strong>
            <em>
                Disclaimer-This report has been prepared solely for informational and educational purposes based on the assessment conducted by Choice Foundation in a non-commercial setting. It is not intended for use in psycho-legal, medico-legal, or judicial proceedings and should not be considered a legal or forensic opinion. Choice Foundation accepts no responsibility or liability for the use or interpretation of this report in legal, medico-legal, or other contexts beyond its intended purpose.
            </em>
        </div>
    `;
}


/* =========================================================
   REPORT FOOTER
   ========================================================= */
function getReportFooter() {

return `
    <div
        class="report-bottom"
        style="
            width:100%;
            margin-top:4mm;
        "
    >

        <div
            class="report-disclaimer"
            style="
                margin-top:4mm;
                padding-top:3mm;
                text-align:justify !important;
            "
        >
            Disclaimer:This report has been prepared solely for informational and educational purposes based on the assessment conducted by Choice Foundation in a non-commercial setting. It is not intended for use in psycho-legal, medico-legal, or judicial proceedings and should not be considered a legal or forensic opinion. Choice Foundation accepts no responsibility or liability for the use or interpretation of this report in legal, medico-legal, or other contexts beyond its intended purpose.
        </div>


        <div
            class="organization-contact"
            style="
                margin-top:3mm;
                padding-top:2mm;
                text-align:left !important;
                font-size:9pt;
                line-height:1.3;
                color:#294b36 !important;
            "
        >

            <strong>CONTACT US</strong>

            <br>

            3rd Floor, Door No. 2-20/4,
            Kothaguda X Roads,
            Hanuman Nagar, Kondapur,
            Land Mark Residency,
            Kothaguda,
            Hyderabad – 500084,
            Telangana

            &nbsp;&nbsp;

            Call: +91 99081 62303

            &nbsp; | &nbsp;

            Email:
            info@choicefoundation.in

            &nbsp; | &nbsp;

            administrator@choicefoundation.in

        </div>

    </div>
    
    
    
`;


}


/* =========================================================
   COMPLETE REPORT RENDER
   ========================================================= */

/* =========================================================
   COMPLETE REPORT RENDER
   ========================================================= */

function renderReport() {

    /*
       Capture the latest form values and
       calculate the assessment before creating
       the final report.
    */


    calculateAssessment();

    if (!assessmentIsValid()) {
        const validationContainer =
            currentStep === 5
                ? $("generatedReport")
                : $("reportContainer");

        if (validationContainer) {
            validationContainer.innerHTML = `
                <div class="report-validation-message">
                    <h3>Report cannot be generated yet</h3>
                    <p>Please correct the validation message shown above.</p>
                </div>
            `;
        }
        return;
    }

    try {
        const reportHTML = `
            <div class="print-report">
                ${getReportVisualOverrides()}
                ${getReportHeader()}
                ${getChildInformationSection()}
                ${getTestsConductedSection()}
                ${getResultsSection()}
                ${getClinicalNarrativeSection()}
                ${getRecommendationsSection()}
                ${getSignatureSection()}
                ${getReportFooter()}
            </div>
        `;

        const reviewContainer = $("reportContainer");
        const previewContainer = $("generatedReport");
        const targetContainer =
            currentStep === 5
                ? (previewContainer || reviewContainer)
                : (reviewContainer || previewContainer);

        if (!targetContainer) {
            console.error("Report container was not found.");
            showMessage("Report preview container was not found.");
            return;
        }

        targetContainer.innerHTML = reportHTML;

        const activeStep = $(currentStep === 5 ? "step5" : "step4");
        if (activeStep) {
            activeStep.classList.add("active-page");
        }

        targetContainer.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    } catch (error) {
        console.error("Report rendering error:", error);
        const errorContainer =
            currentStep === 5
                ? $("generatedReport")
                : $("reportContainer");

        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="report-validation-message">
                    <h3>Report generation error</h3>
                    <p>${escapeHTML(error.message)}</p>
                </div>
            `;
        }
    }
}


/* =========================================================
   INTEGRATED RECOMMENDATIONS
   ========================================================= */

function getIntegratedRecommendations() {

    let recommendations = [];


    /*
       =====================================================
       COMMON RECOMMENDATIONS
       =====================================================
    */

    const comprehensiveAssessmentRecommendation =
        "A comprehensive psychological assessment is recommended. Kindly consult a nearby Rehabilitation Psychologist or Clinical Psychologist, or visit Little Stars & She (Kondapur) or NIEPID, Secunderabad, for further evaluation.";


    const pbsRecommendation =
        "It is recommended to implement Positive Behavior Support (PBS) strategies to address behavioral challenges, promote self-regulation, and enhance compliance and overall school functioning.";


    /*
       =====================================================
       HELPER
       =====================================================

       Adds a recommendation only if the same recommendation
       has not already been added.

       This prevents CPM + SPM + SNAP-IV from producing
       the same comprehensive-assessment recommendation
       multiple times.
    */

    function addRecommendation(
        recommendation
    ) {

        if (
            !recommendation ||
            !String(
                recommendation
            ).trim()
        ) {
            return;
        }


        const newText =
            String(
                recommendation
            ).trim();


        const alreadyExists =
            recommendations.some(
                existing =>
                    String(
                        existing
                    ).trim() === newText
            );


        if (!alreadyExists) {

            recommendations.push(
                newText
            );
        }
    }


    /*
       =====================================================
       CPM
       =====================================================
    */

    if (
        assessment.cpm &&
        assessment.cpm.valid
    ) {

        const cpmRecommendations =
            getCPMRecommendations(
                assessment.cpm
            );


        if (
            Array.isArray(
                cpmRecommendations
            )
        ) {

           const spmGrade =
    assessment.spm &&
    assessment.spm.valid
        ? String(
            assessment.spm.grade || ""
          ).trim()
        : "";

const spmConcern =
    spmGrade === "Grade IV" ||
    spmGrade === "Grade IV−" ||
    spmGrade === "Grade IV-" ||
    spmGrade === "Grade V";


cpmRecommendations.forEach(
    recommendation => {

        const recommendationText =
            String(
                recommendation || ""
            ).trim();


        /*
           If SPM already shows a significant
           concern, do not show CPM's
           "no significant concerns"
           recommendation.
        */

        if (
            spmConcern &&
            recommendationText.startsWith(
                "No significant concerns are identified in non-verbal reasoning"
            )
        ) {
            return;
        }


        /*
           Also suppress the follow-up
           sentence that belongs to the
           CPM no-concern statement.
        */

        if (
            spmConcern &&
            recommendationText.startsWith(
                "If academic or behavioural concerns are identified"
            )
        ) {
            return;
        }


        /*
           Keep the comprehensive assessment
           recommendation centralized.
        */

        if (
            recommendationText ===
            comprehensiveAssessmentRecommendation
        ) {

            addRecommendation(
                comprehensiveAssessmentRecommendation
            );

        } else {

            addRecommendation(
                recommendation
            );
        }
    }
);
        }
        
        
    }


    /*
       =====================================================
       SPM
       =====================================================
    */

    if (
        assessment.spm &&
        assessment.spm.valid
    ) {

        const spmGrade =
            String(
                assessment.spm.grade || ""
            ).trim();


        /*
           Lower SPM performance requires
           comprehensive psychological assessment.
        */
if (
    spmGrade === "Grade IV" ||
    spmGrade === "Grade IV−" ||
    spmGrade === "Grade IV-" ||
    spmGrade === "Grade V"
) {

    addRecommendation(
        comprehensiveAssessmentRecommendation
    );
}
    }


    /*
       =====================================================
       SNAP-IV
       =====================================================
    */

    if (
        assessment.snapData &&
        assessment.snapData.valid
    ) {

        const snapRecommendations =
            assessment.snapData.recommendations;


        if (
            Array.isArray(
                snapRecommendations
            )
        ) {

            snapRecommendations.forEach(
                recommendation => {

                    const text =
                        String(
                            recommendation || ""
                        ).trim();


                    /*
                       CENTRALISE the common
                       comprehensive-assessment recommendation.
                    */

                    if (
                        text ===
                        comprehensiveAssessmentRecommendation
                    ) {

                        addRecommendation(
                            comprehensiveAssessmentRecommendation
                        );

                        return;
                    }


                    /*
                       CENTRALISE PBS so that it is
                       included only once.
                    */

                    if (
                        text ===
                        pbsRecommendation
                    ) {

                        addRecommendation(
                            pbsRecommendation
                        );

                        return;
                    }


                    /*
                       Preserve all other SNAP-IV
                       recommendations.
                    */

                    addRecommendation(
                        text
                    );
                }
            );
        }
    }


    /*
       =====================================================
       DEFAULT
       =====================================================
    */

    if (
        recommendations.length === 0
    ) {

        recommendations.push(

            "No significant concerns are identified based on the present assessment findings. If academic or behavioural concerns are identified, consultation with a Rehabilitation Psychologist or Clinical Psychologist may be considered."

        );
    }


    /*
       =====================================================
       FINAL SAFETY DEDUPLICATION
       =====================================================
    */

    const finalRecommendations = [];


    recommendations.forEach(
        recommendation => {

            const text =
                String(
                    recommendation || ""
                ).trim();


            if (
                !text
            ) {
                return;
            }


            const exists =
                finalRecommendations.some(
                    existing =>
                        existing.trim() === text
                );


            if (
                !exists
            ) {

                finalRecommendations.push(
                    text
                );
            }
        }
    );


    return finalRecommendations;
}


/* =========================================================
   INTEGRATED IMPRESSION
   ========================================================= */

function getIntegratedImpression() {

    const statements = [];


    /* =====================================================
       CPM
       ===================================================== */

    if (
        assessment.cpm &&
        assessment.cpm.valid
    ) {

        const c =
            assessment.cpm;


        statements.push(

            `The child's CPM performance falls at the ${safeValue(c.percentileText)}, corresponding to ${safeValue(c.grade)} (${safeValue(c.classification)}), with a Standard Score of ${safeValue(c.standardScore)}.`

        );
    }


    /* =====================================================
       SPM
       ===================================================== */

    if (
        assessment.spm &&
        assessment.spm.valid
    ) {

        const s =
            assessment.spm;


        statements.push(

            `The child's SPM performance is classified as ${safeValue(s.grade)} (${safeValue(s.classification)}), within the ${safeValue(s.percentile)} based on the configured age-specific reference scoring system.`

        );
    }


    /* =====================================================
       SNAP-IV
       ===================================================== */

    if (
        assessment.snapData &&
        assessment.snapData.valid
    ) {

        const s =
            assessment.snapData;


        const profileText = {

            NONE:
                "no clinically significant elevation across the assessed SNAP-IV domains",

            INATTENTION:
                "clinically significant Inattention symptoms",

            HYPERACTIVITY:
                "clinically significant Hyperactivity/Impulsivity symptoms",

            COMBINED_ADHD:
                "clinically significant Inattention and Hyperactivity/Impulsivity symptoms",

            ODD:
                "clinically significant Oppositional/Defiant symptoms",

            INATTENTION_ODD:
                "clinically significant Inattention and Oppositional/Defiant symptoms",

            HYPERACTIVITY_ODD:
                "clinically significant Hyperactivity/Impulsivity and Oppositional/Defiant symptoms",

            COMBINED_ADHD_ODD:
                "clinically significant elevations across Inattention, Hyperactivity/Impulsivity and Oppositional/Defiant domains"
        };


        statements.push(

            `The SNAP-IV findings indicate ${profileText[s.profile] || "the entered screening profile"}.`

        );


        /*
           Isolated ODD must still mention
           potential ADHD risk.
        */

        if (
            s.profile === "ODD"
        ) {

            statements.push(

                "Although the elevation is isolated to the Opposition/Defiance subscale, an elevated score in any SNAP-IV domain indicates a potential risk for ADHD. Therefore, further diagnostic assessment is required to definitively rule out ADHD."

            );

        } else if (
            s.atRiskForADHD ||
            s.risk
        ) {

            statements.push(

                "The elevated SNAP-IV scores indicate a potential risk for ADHD. Therefore, further diagnostic assessment is required to definitively rule out ADHD."

            );
        }
    }


    /* =====================================================
       SLD / ACADEMIC CONTEXT
       ===================================================== */

    if (
        assessment.sldScreened
    ) {

        statements.push(

            "The findings should be interpreted in the context of the child's academic functioning, language background and educational history. Difficulties associated with transition between languages of instruction may also influence academic performance and behavioural screening results."

        );
    }


    /* =====================================================
       NO FINDINGS
       ===================================================== */

    if (
        !statements.length
    ) {

        return "No assessment findings are available.";
    }


    /*
       Final integrated statement.
    */

    return (

        statements.join(" ") +

        " The findings should be interpreted in conjunction with developmental history, academic functioning, behavioural observations and relevant contextual information."

    );
}


/* =========================================================
   SIGNATURE SECTION
   ========================================================= */


function getSignatureSection() {

    const child =
        assessment.child || {};

    const issuedDate =
        formatDate(
            child.assessmentDate
        );

    const assessorName =
        child.assessedBy || "Athira CM";

    const assessor =
        ASSESSORS[assessorName] ||
        ASSESSORS["Athira CM"];

    return `
        <div
            class="signature-section"
            style="
                width:100%;
                margin-top:5mm;
                text-align:left !important;
            "
        >

            <table
                class="signature-table"
                style="
                    width:100%;
                    table-layout:fixed;
                    border:none !important;
                    border-collapse:collapse;
                    margin-top:3mm;
                "
            >

                <tr>

                    <td
                        style="
                            width:50%;
                            border:none !important;
                            padding:0 8mm 0 0;
                            vertical-align:top !important;
                            text-align:left !important;
                            line-height:1.45;
                        "
                    >

                        <strong>Report Issued By:</strong>

                        <div style="margin-top:2mm;">

                            <span
                                class="signature-name"
                                style="
                                    font-weight:700;
                                "
                            >
                                K. Dharmalinga Chaitanya
                            </span>

                            <br>
                            M.A(Psy), M.Phil. (Rehab Psy)

                            <br>
                            Rehabilitation Psychologist

                            <br>
                            Choice Foundation

                            <br>
                            CRR No: A91575

                        </div>

                    </td>


                    <td
                        style="
                            width:50%;
                            border:none !important;
                            padding:0 0 0 8mm;
                            vertical-align:top !important;
                            text-align:left !important;
                            line-height:1.45;
                        "
                    >

                        <strong>Assessed By:</strong>

                        <div style="margin-top:2mm;">

                            <span
                                class="signature-name"
                                style="
                                    font-weight:700;
                                "
                            >
                                ${assessorName}
                            </span>

                            <br>
                            ${assessor.qualification}

                            <br>
                            ${assessor.designation}

                            <br>
                            ${assessor.organisation}

                        </div>

                    </td>

                </tr>

            </table>


            <div
                class="issued-date"
                style="
                    margin-top:4mm;
                    text-align:left !important;
                    font-size:9pt;
                "
            >

                <strong>Issued on:</strong>
                ${issuedDate}

            </div>

        </div>
    `;
}




 /* =========================================================
    GENERATE REPORT BUTTON
    ========================================================= */

function bindGenerateReport() {

    /*
       Your HTML may use generateBtn.
       The older JS used generateReport.
       Support both so the button cannot silently fail.
    */

    const button =
        $("generateBtn") ||
        $("generateReport");


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            /*
               Capture the latest values before
               generating the report.
            */

            readChildInformation();

            readInstrumentSelection();

            readSLDScreening();

            calculateAssessment();

            /*
               Go directly to Report Preview.
            */

            openStep(4);

        }
    );
}


/* =========================================================
   PRINT BUTTON
   ========================================================= */

/* =========================================================
   PRINT / SAVE AS PDF BUTTON
   ========================================================= */

function bindPrintButton() {


const button =
    $("printBtn") ||
    $("printReport");

if (!button) {
    return;
}

button.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        event.stopPropagation();

        printReport();

    }
);


}

/* =========================================================
GLOBAL PRINT / SAVE AS PDF FUNCTION
HTML BUTTON ALSO CALLS THIS DIRECTLY
========================================================= */
function printReport() {


/*
   Make sure the latest assessment values
   are captured before printing.
*/

try {

    if (typeof readChildInformation === "function") {
        readChildInformation();
    }

    if (typeof readInstrumentSelection === "function") {
        readInstrumentSelection();
    }

    if (typeof readSLDScreening === "function") {
        readSLDScreening();
    }

    if (typeof calculateAssessment === "function") {
        calculateAssessment();
    }

} catch (error) {

    console.error(
        "Unable to refresh assessment before printing:",
        error
    );

}


/*
   Generate the latest report.
*/

try {

    if (typeof renderReport === "function") {
        renderReport();
    }

} catch (error) {

    console.error(
        "Unable to render report before printing:",
        error
    );

}


/*
   Find the actual printable report.
*/

const report =
    document.querySelector(".print-report") ||
    document.querySelector(".report-paper") ||
    document.querySelector("#generatedReport") ||
    document.querySelector("#reportContainer");


if (!report) {

    alert(
        "The report could not be prepared for printing. Please generate the report first."
    );

    return;

}


/*
   Remove an older temporary print stylesheet
   if one is already present.
*/

const oldPrintStyle =
    document.getElementById(
        "choiceFoundationPdfPrintStyles"
    );

if (oldPrintStyle) {
    oldPrintStyle.remove();
}


/*
   Create PDF-only styling.

   IMPORTANT:
   These rules affect the actual browser
   Print / Save as PDF output.
*/

const printStyle =
    document.createElement("style");

printStyle.id =
    "choiceFoundationPdfPrintStyles";


printStyle.textContent = `

    @page {

        size: A4 portrait;

        /*
           Keep a small physical margin around
           every printed page.
        */

        margin:
            0;

    }


    @media print {


        /*
           =====================================================
           BASIC A4 PAGE CONTROL
           =====================================================
        */

        html,
        body {

            width:
                210mm !important;

            margin:
                0 !important;

            padding:
                0 !important;

            background:
                #FFFFFF !important;

        }


        body {

            -webkit-print-color-adjust:
                exact !important;

            print-color-adjust:
                exact !important;

        }


        /*
           =====================================================
           MAIN PRINT REPORT
           =====================================================
        */

        .print-report {

            width:
                210mm !important;

            max-width:
                210mm !important;

            min-height:
                0 !important;

            height:
                auto !important;

            margin:
                0 !important;

            /*
               Slightly larger bottom padding gives
               the footer/contact area breathing space.
            */

            padding:
                12mm
                15mm
                17mm
                15mm !important;

            box-sizing:
                border-box !important;

            background:
                #FFFFFF !important;

            color:
                #1F2933 !important;

            font-family:
                Arial,
                Helvetica,
                sans-serif !important;

            font-size:
                10pt !important;

            line-height:
                1.42 !important;

            -webkit-print-color-adjust:
                exact !important;

            print-color-adjust:
                exact !important;

        }


        /*
           =====================================================
           NORMAL REPORT TEXT
           =====================================================
        */

        .print-report p,
        .print-report li,
        .print-report td,
        .print-report div,
        .print-report span {

            color:
                #1F2933 !important;

        }


        /*
           =====================================================
           REPORT HEADINGS
           =====================================================
        */

        .print-report h2,
        .print-report .report-section-title {

            background:
                #17365D !important;

            color:
                #FFFFFF !important;

            border-left:
                4px solid #587889 !important;

            padding:
                2.8mm 4mm !important;

            margin:
                4mm 0 2.5mm 0 !important;

            font-size:
                12pt !important;

            font-weight:
                700 !important;

            text-transform:
                uppercase !important;

            line-height:
                1.2 !important;

            /*
               Keep heading with the beginning
               of the section.
            */

            break-after:
                avoid !important;

            page-break-after:
                avoid !important;

            -webkit-print-color-adjust:
                exact !important;

            print-color-adjust:
                exact !important;

        }


        /*
           =====================================================
           REPORT HEADER
           =====================================================
        */

        .print-report .report-header {

            break-inside:
                avoid !important;

            page-break-inside:
                avoid !important;

        }


        .print-report .report-logo {

            break-inside:
                avoid !important;

            page-break-inside:
                avoid !important;

        }


        .print-report .report-logo img {

            max-width:
                100% !important;

            height:
                auto !important;

        }


        /*
           =====================================================
           GENERAL TABLE CONTROL
           =====================================================
        */

        .print-report table {

            width:
                100% !important;

            max-width:
                100% !important;

            border-collapse:
                collapse !important;

        }


        .print-report th,
        .print-report td {

            color:
                #1F2933 !important;

            border-color:
                #9FB6C8 !important;

        }


        /*
           =====================================================
           RESULT TABLES
           =====================================================
        */

        .print-report .result-table {

            width:
                100% !important;

            border-collapse:
                collapse !important;

            table-layout:
                fixed !important;

        }


        .print-report .result-table th {

            background:
                #2F5597 !important;

            color:
                #FFFFFF !important;

            font-weight:
                700 !important;

            border:
                1px solid #9FB6C8 !important;

            -webkit-print-color-adjust:
                exact !important;

            print-color-adjust:
                exact !important;

        }


        .print-report .result-table td {

            background:
                #FFFFFF !important;

            color:
                #111827 !important;

            border:
                1px solid #9FB6C8 !important;

        }


        .print-report .result-table tbody tr:nth-child(even) td {

            background:
                #F7FAFC !important;

            color:
                #111827 !important;

        }


        /*
           =====================================================
           UNIFIED RESULT TABLE
           =====================================================
        */

        .print-report .unified-results-table {

            width:
                100% !important;

            table-layout:
                fixed !important;

        }


        .print-report .unified-results-table th {

            background:
                #2F5597 !important;

            color:
                #FFFFFF !important;

            border:
                1px solid #9FB6C8 !important;

            -webkit-print-color-adjust:
                exact !important;

            print-color-adjust:
                exact !important;

        }


        .print-report .unified-results-table td {

            background:
                #FFFFFF !important;

            color:
                #111827 !important;

            border:
                1px solid #9FB6C8 !important;

        }


        .print-report .unified-results-table tbody tr:nth-child(even) td {

            background:
                #F7FAFC !important;

        }


        /*
           =====================================================
           TABLE ROWS
           =====================================================

           Prevent individual rows from being split.
        */

        .print-report tr {

            break-inside:
                avoid !important;

            page-break-inside:
                avoid !important;

        }


        /*
           =====================================================
           SLD / ACADEMIC LEARNING SECTION
           =====================================================

           We DO NOT prevent the entire SLD section
           from splitting. This is important because
           the SLD paragraph can become long.

           The browser may therefore continue it
           naturally onto the next page.
        */

        .print-report .report-section {

            break-before:
                auto !important;

            break-after:
                auto !important;

        }


        .print-report .report-section p {

            orphans:
                3;

            widows:
                3;

        }


        /*
           =====================================================
           CLINICAL IMPRESSION
           =====================================================

           If the whole Clinical Impression can fit in
           the remaining page space, keep it together.

           If it is too large, the browser is allowed
           to split it naturally.
        */

        .print-report .impression-text {

            orphans:
                4;

            widows:
                4;

        }


        /*
           Keep the Clinical Impression heading with
           its paragraph.
        */

        .print-report .report-section:has(.impression-text) h2 {

            break-after:
                avoid !important;

            page-break-after:
                avoid !important;

        }


        /*
           =====================================================
           RECOMMENDATIONS
           =====================================================

           Keep recommendation items intact.

           The complete recommendations block is NOT
           forced onto one page because it may become
           longer depending on the assessment.
        */

        .print-report .recommendations-list {

            margin-top:
                2mm !important;

            margin-bottom:
                2mm !important;

            padding-left:
                6mm !important;

        }


        .print-report .recommendations-list li {

            break-inside:
                avoid !important;

            page-break-inside:
                avoid !important;

            orphans:
                3;

            widows:
                3;

            margin-bottom:
                1.5mm !important;

        }


        /*
           Keep Recommendations heading with
           the first recommendation.
        */

        .print-report .report-section:has(.recommendations-list) h2 {

            break-after:
                avoid !important;

            page-break-after:
                avoid !important;

        }


        /*
           =====================================================
           INTERPRETATION BOX
           =====================================================
        */

        .print-report .interpretation-box {

            background:
                #F3F7FB !important;

            border:
                1px solid #9FB6C8 !important;

            color:
                #1F2933 !important;

            padding:
                3mm !important;

            -webkit-print-color-adjust:
                exact !important;

            print-color-adjust:
                exact !important;

        }


        .print-report .interpretation-box h3 {

            color:
                #17365D !important;

            margin-top:
                0 !important;

            break-after:
                avoid !important;

            page-break-after:
                avoid !important;

        }


        .print-report .interpretation-box p {

            color:
                #1F2933 !important;

            margin-bottom:
                0 !important;

            orphans:
                3;

            widows:
                3;

        }


        /*
           =====================================================
           GENERAL LISTS
           =====================================================
        */

        .print-report ul,
        .print-report ol {

            color:
                #1F2933 !important;

        }


        .print-report li {

            color:
                #1F2933 !important;

        }


        /*
           =====================================================
           SIGNATURE SECTION
           =====================================================
        */

        .print-report .signature-section {

            width:
                100% !important;

            break-inside:
                avoid !important;

            page-break-inside:
                avoid !important;

        }


        .print-report .signature-table {

            width:
                100% !important;

            table-layout:
                fixed !important;

            border:
                none !important;

            border-collapse:
                collapse !important;

        }


        .print-report .signature-table td {

            border:
                none !important;

            background:
                #FFFFFF !important;

            color:
                #1F2933 !important;

            vertical-align:
                top !important;

        }


        /*
           =====================================================
           BOTTOM REPORT GROUP
           =====================================================

           These are small blocks, so they should remain
           together instead of being split across pages.
        */

        .print-report .report-bottom {

            break-inside:
                avoid !important;

            page-break-inside:
                avoid !important;

            margin-top:
                5mm !important;

        }


        .print-report .report-disclaimer {

            break-inside:
                avoid !important;

            page-break-inside:
                avoid !important;

            color:
                #596773 !important;

        }


        .print-report .report-disclaimer p {

            color:
                #596773 !important;

        }


        .print-report .organization-contact {

            break-inside:
                avoid !important;

            page-break-inside:
                avoid !important;

            margin-top:
                3mm !important;

            padding-top:
                2mm !important;

            color:
                #17365D !important;

            font-size:
                9pt !important;

            line-height:
                1.25 !important;

        }


        .print-report .organization-contact strong {

            color:
                #17365D !important;

        }


        /*
           =====================================================
           LINKS
           =====================================================
        */

        .print-report a {

            color:
                #1F2933 !important;

            text-decoration:
                none !important;

        }


        /*
           =====================================================
           HORIZONTAL OVERFLOW PROTECTION
           =====================================================
        */

        .print-report img {

            max-width:
                100% !important;

        }


        /*
           =====================================================
           PRINT BUTTONS / TOOLBAR
           =====================================================
        */

        .report-toolbar,
        .report-actions {

            display:
                none !important;

        }

    }

`;


/*
   Add the print-only CSS to the document.
*/

document.head.appendChild(
    printStyle
);


/*
   Print the report.
*/

window.print();


/*
   Remove temporary print CSS after
   the browser finishes printing.
*/

window.addEventListener(
    "afterprint",
    function removeChoiceFoundationPrintStyle() {

        const style =
            document.getElementById(
                "choiceFoundationPdfPrintStyles"
            );

        if (style) {

            style.remove();

        }

        window.removeEventListener(
            "afterprint",
            removeChoiceFoundationPrintStyle
        );

    },
    { once: true }
);


}



/*
Make the function available to the
HTML onclick="printReport()" button.
*/

window.printReport =
printReport;


/* =========================================================
   RESET ASSESSMENT
   ========================================================= */

function resetAssessment() {

    /*
       Reset application state.
    */

    assessment.matrix =
        null;

    assessment.snap =
        false;

    assessment.sldScreened =
        false;


    assessment.child =
        {

            name:
                "",

            class:
                "",

            className:
                "",

            uid:
                "",

            gender:
                "",

            school:
                "",

            schoolName:
                "",

            assessmentDate:
                "",

            date:
                "",

            ageYears:
                "",

            ageMonths:
                ""

        };


    assessment.cpm =
        null;

    assessment.spm =
        null;

    assessment.snapData =
        null;


    /*
       Clear all form controls.
    */

    document
        .querySelectorAll(
            "input, select, textarea"
        )
        .forEach(
            function (element) {

                if (
                    element.type ===
                    "radio"
                ) {

                    element.checked =
                        false;

                }

                else if (
                    element.type ===
                    "checkbox"
                ) {

                    element.checked =
                        false;

                }

                else {

                    element.value =
                        "";

                }

            }
        );


    /*
       Clear dynamically generated
       score sections.
    */

const scoreContainer =
    $("scoreContainer");


    if (
        scoreContainer
    ) {

        scoreContainer.innerHTML =
            "";

    }


    /*
       Clear report.
    */

    const reportContainer =
        $("reportContainer");


    if (
        reportContainer
    ) {

        reportContainer.innerHTML =
            "";

    }


    /*
       Clear review if present.
    */

    const reviewContainer =
        $("reviewContainer");


    if (
        reviewContainer
    ) {

        reviewContainer.innerHTML =
            "";

    }


    /*
       Refresh live UI.
    */

    renderLiveSummary();

    updateValidationStatus();


    /*
       IMPORTANT:
       The application uses step navigation,
       not showSection().
    */

    openStep(1);

}


/* =========================================================
   RESET BUTTON BINDING
   ========================================================= */

function bindResetButton() {

    const button =
        $("resetBtn") ||
        $("resetAssessment");


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            resetAssessment();

        }
    );
}


/* =========================================================
   NAVIGATION BUTTONS
   ========================================================= */

function bindNavigationButtons() {

    /*
       NEXT BUTTONS
    */

    document
        .querySelectorAll(
            ".next-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();


                        /*
                           Always capture current
                           child information.
                        */

                        readChildInformation();


                        /*
                           Find the currently
                           active page.
                        */

                        const currentPage =
                            document.querySelector(
                                ".step-page.active-page"
                            );


                        if (
                            !currentPage
                        ) {

                            return;

                        }


                        const currentStepNumber =
                            Number(
                                currentPage.id
                                    .replace(
                                        "step",
                                        ""
                                    )
                            );


                        /* =====================================
                           STEP 1 → STEP 2
                           ===================================== */

                        if (
                            currentStepNumber === 1
                        ) {

                            if (
                                !validateChildInformation()
                            ) {

                                return;

                            }


                            openStep(2);

                            return;

                        }


                        /* =====================================
                           STEP 2 → STEP 3
                           ===================================== */

                        if (
                            currentStepNumber === 2
                        ) {

                            readInstrumentSelection();


                            /*
                               At least one instrument
                               must be selected.
                            */

                            if (
                                !assessment.matrix &&
                                !assessment.snap
                            ) {

                                showMessage(
                                    "Please select at least one assessment instrument."
                                );

                                return;

                            }


                            openStep(3);

                            return;

                        }


                        /* =====================================
                           STEP 3 → STEP 4
                           ===================================== */

                        if (
                            currentStepNumber === 3
                        ) {

                            readChildInformation();

                            readInstrumentSelection();

                            calculateAssessment();


                            /*
                               openStep(4) will call
                               renderReport().
                            */

                            openStep(4);

                            return;

                        }


                        /* =====================================
                           STEP 4 → STEP 5
                           ===================================== */

                        if (
                            currentStepNumber === 4
                        ) {

                            readChildInformation();

                            readInstrumentSelection();

                            calculateAssessment();


                            if (
                                !assessmentIsValid()
                            ) {

                                return;

                            }


                            openStep(5);

                            return;

                        }

                    }
                );

            }
        );


    /*
       PREVIOUS BUTTONS
    */

    document
        .querySelectorAll(
            ".prev-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();


                        const currentPage =
                            document.querySelector(
                                ".step-page.active-page"
                            );


                        if (
                            !currentPage
                        ) {

                            return;

                        }


                        const currentStepNumber =
                            Number(
                                currentPage.id
                                    .replace(
                                        "step",
                                        ""
                                    )
                            );


                        if (
                            currentStepNumber > 1
                        ) {

                            openStep(
                                currentStepNumber - 1
                            );

                        }

                    }
                );

            }
        );


    /*
       SIDEBAR / STEP NAVIGATION
    */

    document
        .querySelectorAll(
            ".nav-step"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();


                        const targetStep =
                            Number(
                                this.dataset.step
                            );


                        if (
                            !targetStep
                        ) {

                            return;

                        }


                        /*
                           Always save the current
                           child information.
                        */

                        readChildInformation();


                        openStep(
                            targetStep
                        );

                    }
                );

            }
        );

}




/* =========================================================
   FORM INPUT BINDING
   ========================================================= */

function bindAssessmentInputs() {

    const inputIds = [
        "childName",
        "uid",
        "className",
        "schoolName",
        "gender",
        "assessmentDate",

        "cpmAgeYears",
        "cpmAgeMonths",
        "cpmScore",

        "spmAgeYears",
        "spmAgeMonths",
        "spmScore",

        "snapInattention",
        "snapHyperactivity",
        "snapOpposition",

        "sldScreened"
    ];

    inputIds.forEach(function (id) {

        const element = $(id);

        if (!element) {
            return;
        }

        element.addEventListener(
            "input",
            function () {

                readChildInformation();

                if (
                    id === "cpmAgeYears" ||
                    id === "cpmAgeMonths" ||
                    id === "cpmScore" ||
                    id === "spmAgeYears" ||
                    id === "spmAgeMonths" ||
                    id === "spmScore"
                ) {
                    updateLiveSummary();
                }
            }
        );

        element.addEventListener(
            "change",
            function () {

                readChildInformation();

                if (id === "gender") {
                    updateLiveSummary();
                }

                if (id === "assessmentDate") {
                    updateLiveSummary();
                }
            }
        );
    });
}



/* =========================================================
   LIVE SUMMARY
   ========================================================= */

function updateLiveSummary() {

    /*
       Update the small summary areas on the page.
       Missing elements are simply ignored.
    */

    const childName =
        $("childName")?.value.trim() || "";

    const uid =
        $("uid")?.value.trim() || "";

    const className =
        $("className")?.value.trim() || "";

    const school =
        $("schoolName")?.value.trim() || "";

    const gender =
        $("gender")?.value || "";

    const assessmentDate =
        $("assessmentDate")?.value || "";

    const summaryName =
        $("summaryName");

    const summaryUid =
        $("summaryUid");

    const summaryClass =
        $("summaryClass");

    const summarySchool =
        $("summarySchool");

    const summaryGender =
        $("summaryGender");

    const summaryDate =
        $("summaryDate");


    if (summaryName) {
        summaryName.textContent =
            childName || "—";
    }

    if (summaryUid) {
        summaryUid.textContent =
            uid || "—";
    }

    if (summaryClass) {
        summaryClass.textContent =
            className || "—";
    }

    if (summarySchool) {
        summarySchool.textContent =
            school || "—";
    }

    if (summaryGender) {
        summaryGender.textContent =
            gender || "—";
    }

    if (summaryDate) {
        summaryDate.textContent =
            assessmentDate || "—";
    }
}




/* =========================================================
   LIVE SUMMARY COMPATIBILITY
   ========================================================= */

function renderLiveSummary() {

    if (typeof updateLiveSummary === "function") {
        updateLiveSummary();
    }

}

/* =========================================================
   INSTRUMENT SELECTION BINDING
   ========================================================= */

function bindInstrumentSelection() {

    const matrixInputs =
        document.querySelectorAll(
            'input[name="matrix"]'
        );

    matrixInputs.forEach(function (input) {

        input.addEventListener(
            "change",
            function () {

                readInstrumentSelection();

                updateInstrumentSummary();

                renderScoreFields();

                updateLiveSummary();
            }
        );

    });


    const snap =
        $("snapSelected");

    if (snap) {

        snap.addEventListener(
            "change",
            function () {

                readInstrumentSelection();

                updateInstrumentSummary();

                renderScoreFields();

                updateLiveSummary();
            }
        );

    }
}



/* =========================================================
   VALIDATION STATUS
   ========================================================= */

function updateValidationStatus() {

    const statusElement =
        $("validationStatus");

    if (!statusElement) {
        return;
    }

    const messages = [];

    /*
       Child information
    */

    readChildInformation();

    if (!childInformation.className) {
        messages.push("Class is required.");
    }

    if (!childInformation.uid) {
        messages.push("UID is required.");
    }

    /*
       Assessment date
    */

    if (!childInformation.assessmentDate) {
        messages.push("Assessment date is required.");
    }

    /*
       Instruments
    */

    readInstrumentSelection();

    const selectedCount =
        selectedInstruments.length;

    if (selectedCount === 0) {
        messages.push("Select at least one assessment instrument.");
    }

    /*
       Display validation state
    */

    if (messages.length === 0) {

        statusElement.innerHTML =
            '<span class="validation-valid">Assessment information is ready.</span>';

        statusElement.classList.remove(
            "validation-error"
        );

        statusElement.classList.add(
            "validation-ok"
        );

    } else {

        statusElement.innerHTML =
            messages
                .map(message =>
                    `<div>${safeValue(message)}</div>`
                )
                .join("");

        statusElement.classList.remove(
            "validation-ok"
        );

        statusElement.classList.add(
            "validation-error"
        );
    }
}
/* =========================================================
   APPLICATION INITIALISATION
   ========================================================= */

function initialiseApplication() {

    /*
       Read initial child information.
    */

    readChildInformation();


    /*
       Bind all form inputs.
    */

    bindAssessmentInputs();


    /*
       Instrument selection.
    */

    bindInstrumentSelection();


    /*
       Report generation.
    */

    bindGenerateReport();


    /*
       Print.
    */

    bindPrintButton();


    /*
       Reset.
    */

    bindResetButton();


    /*
       Next / Previous / Sidebar navigation.
    */

    bindNavigationButtons();


    /*
       Initial UI state.
    */

    renderLiveSummary();

    updateValidationStatus();


    /*
       Start at Step 1.
    */

    openStep(1);

}


/* =========================================================
   DOM READY
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialiseApplication
    );

} else {

    initialiseApplication();

}


/* =========================================================
   END OF SCRIPT
   ========================================================= */
   
   
 
