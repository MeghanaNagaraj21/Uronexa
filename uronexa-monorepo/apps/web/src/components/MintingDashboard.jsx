import React, { useMemo } from 'react';
import ClinicalCopilot from './ClinicalCopilot';

const MintingDashboard = ({ onSecure, isMinting }) => {
    // Helper to check biomass levels
    const isAtLeast = (val, level) => {
        const levels = ["Negative", "Trace", "Small", "Moderate", "Large", "Positive"];
        const valIndex = levels.indexOf(val?.replace(/\+/g, "").split(" ")[0]);
        const levelIndex = levels.indexOf(level);
        return valIndex >= levelIndex;
    };

    // Mock image metrics for the demonstration
    const imageMetrics = {
        whiteBalanceDeviation: 65, // > 50 (-15)
        glareVariance: 12,        // > 10 (-10)
        blurLaplacian: 180        // > 150 (0)
    };

    const mockResult = {
        riskScore: 8.52,
        cid: "QmXoyp...7Vbh",
        biomarkers: {
            "Leukocytes": { status: "Moderate", color: "#ff4d4d" },
            "Nitrite": { status: "Positive", color: "#ff4d4d" },
            "Urobilinogen": { status: "Normal", color: "#00ffa3" },
            "Protein": { status: "Trace", color: "#ffa300" },
            "pH": { status: "8.5 (Alkaline)", color: "#00ffa3" },
            "Blood": { status: "Negative", color: "#00ffa3" },
            "Specific Gravity": { status: "1.025", color: "#00ffa3" },
            "Ketones": { status: "Negative", color: "#00ffa3" },
            "Bilirubin": { status: "Negative", color: "#00ffa3" },
            "Glucose": { status: "Negative", color: "#00ffa3" }
        }
    };

    // Task 1: AI Confidence Logic
    const confidenceScore = useMemo(() => {
        let score = 100;
        const lowGlareThreshold = 10;
        const highGlareThreshold = 30;
        const minimumSharpness = 150;

        if (imageMetrics.whiteBalanceDeviation > 100) score -= 30;
        else if (imageMetrics.whiteBalanceDeviation > 50) score -= 15;

        if (imageMetrics.glareVariance > highGlareThreshold) score -= 25;
        else if (imageMetrics.glareVariance > lowGlareThreshold) score -= 10;

        if (imageMetrics.blurLaplacian < minimumSharpness) score -= 20;

        return score;
    }, [imageMetrics]);

    // Task 2: Cross-Biomarker Synergy Engine
    const clinicalFlags = useMemo(() => {
        const flags = [];
        const b = mockResult.biomarkers;

        // Helper to check levels
        const isAtLeast = (val, level) => {
            const levels = ["Negative", "Trace", "Small", "Moderate", "Large", "Positive"];
            const valIndex = levels.indexOf(val?.replace(/\+/g, "").split(" ")[0]);
            const levelIndex = levels.indexOf(level);
            return valIndex >= levelIndex;
        };

        const getVal = (key) => b[key]?.status?.split(" ")[0];

        // Bacterial UTI Flag
        if (getVal("Nitrite") === "Positive" && isAtLeast(getVal("Leukocytes"), "Small")) {
            flags.push({ title: "Bacterial UTI", type: "warning" });
        } else if (isAtLeast(getVal("Leukocytes"), "Moderate") && getVal("Nitrite") === "Negative") {
            flags.push({ title: "Possible Atypical/Gram-Positive UTI", type: "info" });
        }

        // Renal Stress Flag
        const proteinNum = parseFloat(getVal("Protein")) || 0;
        if (proteinNum >= 30 && isAtLeast(getVal("Blood"), "Trace")) {
            flags.push({ title: "Renal Stress", type: "danger" });
        } else if (proteinNum === 30 && parseFloat(getVal("Specific Gravity")) >= 1.030) {
            flags.push({ title: "Mild Proteinuria (Concentration)", type: "info" });
        }

        // DKA Flag
        if (isAtLeast(getVal("Glucose"), "Moderate") && isAtLeast(getVal("Ketones"), "Trace") && parseFloat(getVal("pH")) < 6.0) {
            flags.push({ title: "DKA Potential", type: "danger" });
        } else if (getVal("Glucose") === "Negative" && isAtLeast(getVal("Ketones"), "Small")) {
            flags.push({ title: "Dietary Ketosis/Fasting", type: "info" });
        }

        // Hepatobiliary Dysfunction Flag
        if (isAtLeast(getVal("Bilirubin"), "Small") && getVal("Urobilinogen") === "High") {
            flags.push({ title: "Hepatobiliary Dysfunction", type: "danger" });
        }

        return flags;
    }, [mockResult.biomarkers]);

    // Task 3: Automated Triage Levels
    const triageData = useMemo(() => {
        const b = mockResult.biomarkers;
        const flags = clinicalFlags;
        const getVal = (key) => b[key]?.status?.replace(/\+/g, "").split(" ")[0];

        const hasFlag = (title) => flags.some(f => f.title.includes(title));

        // Level 4: Urgent
        if (hasFlag("DKA") || hasFlag("Hepatobiliary") || hasFlag("Renal Stress") || isAtLeast(getVal("Glucose"), "Large")) {
            return {
                level: 4,
                color: "#FF003C",
                title: "URGENT EVALUATION",
                msg: "CRITICAL: High-risk biomarker combinations detected. Seek immediate medical evaluation at an urgent care facility."
            };
        }

        // Level 3: Physician Review
        const hasUTIFlag = hasFlag("UTI");
        const protein30 = parseFloat(getVal("Protein")) === 30;
        const noBlood = getVal("Blood") === "Negative";
        const traceBlood = isAtLeast(getVal("Blood"), "Trace");
        const noLeuk = getVal("Leukocytes") === "Negative";

        if (hasUTIFlag || (protein30 && noBlood) || (traceBlood && noLeuk)) {
            return {
                level: 3,
                color: "#FF8C00",
                title: "PHYSICIAN REVIEW",
                msg: "Biomarker abnormalities detected. Schedule a non-urgent consultation with your primary care physician."
            };
        }

        // Level 2: Lifestyle Adjustment
        const highSG = parseFloat(getVal("Specific Gravity")) >= 1.030;
        const lowPH = parseFloat(getVal("pH")) < 5.0;
        const fastingKetones = getVal("Ketones") === "Trace" && getVal("Glucose") === "Negative";

        if (highSG || lowPH || fastingKetones) {
            return {
                level: 2,
                color: "#FFD700",
                title: "LIFESTYLE ADVISORY",
                msg: "Suboptimal hydration or dietary indicators detected. Increase water intake significantly and retest in 24 hours."
            };
        }

        // Level 1: Routine
        return {
            level: 1,
            color: "#00FFA3",
            title: "ROUTINE STATUS",
            msg: "All biochemical parameters are within normal reference ranges. Continue routine health monitoring."
        };
    }, [clinicalFlags, mockResult.biomarkers]);

    return (
        <div style={{ marginTop: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>

            {/* Scan Quality Pill */}
            <div className={`scan-quality-pill ${confidenceScore >= 90 ? 'quality-optimal' : confidenceScore >= 75 ? 'quality-suboptimal' : 'quality-rejected'}`}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 8px currentColor' }}></div>
                <span>
                    {confidenceScore >= 90 ? 'Optimal Scan' :
                        confidenceScore >= 75 ? 'Acceptable: Suboptimal lighting may cause minor deviations' :
                            'Rejected: Severe shadow/glare. Retake photo'}
                </span>
            </div>

            {/* Triage Card */}
            <div className={`glass triage-card triage-level-${triageData.level}`}>
                <div className="triage-label">Auto-Triage Analysis</div>
                <div className="triage-title" style={{ color: triageData.color }}>{triageData.title}</div>
                <div className="triage-msg">{triageData.msg}</div>

                {clinicalFlags.length > 0 && (
                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                        {clinicalFlags.map((flag, i) => (
                            <span key={i} className="clinical-flag">{flag.title}</span>
                        ))}
                    </div>
                )}
            </div>

            <div className={`glass ${confidenceScore < 75 ? 'blur-results' : ''}`} style={{
                width: '100%',
                maxWidth: '700px',
                padding: '3rem',
                borderRadius: '24px',
                textAlign: 'center',
                transition: 'all 0.5s ease'
            }}>
                <h2 className="glow-cyan" style={{ marginBottom: '0.5rem', fontSize: '0.8rem', letterSpacing: '4px' }}>
                    DIAGNOSTIC MATRIX
                </h2>
                <div style={{ fontSize: '5rem', fontWeight: '900', margin: '1rem 0' }}>
                    {mockResult.riskScore}
                    <span style={{ fontSize: '1.5rem', fontWeight: '300', color: '#888' }}>/10</span>
                </div>
                <p style={{ color: triageData.color, fontSize: '0.9rem', marginBottom: '2rem', letterSpacing: '1px' }}>
                    UTI RISK LEVEL: <span style={{ fontWeight: 'bold' }}>{mockResult.riskScore >= 7 ? 'CRITICAL' : mockResult.riskScore >= 4 ? 'ELEVATED' : 'LOW'}</span>
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'left', marginBottom: '3rem' }}>
                    {Object.entries(mockResult.biomarkers).map(([name, data], i) => (
                        <div key={i} className="glass" style={{ padding: '1rem', borderRadius: '12px', borderLeft: `4px solid ${data.color}` }}>
                            <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.3rem' }}>{name}</div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{data.status}</div>
                        </div>
                    ))}
                </div>

                {/* New Clinical AI Copilot Section */}
                <div style={{ width: '100%', marginTop: '2rem', marginBottom: '2rem' }}>
                    <h3 className="glow-cyan" style={{ marginBottom: '1rem', fontSize: '0.9rem', letterSpacing: '2px', textAlign: 'left' }}>
                        ASK CLINICAL AI
                    </h3>

                    <ClinicalCopilot
                        riskScore={mockResult.riskScore}
                        biomarkers={mockResult.biomarkers}
                    />
                </div>

                <div style={{ width: '100%' }}>
                    <button
                        className="btn-glow btn-glow-green pulse"
                        onClick={() => onSecure(mockResult.riskScore, mockResult.cid)}
                        disabled={isMinting || confidenceScore < 75}
                        style={{ width: '100%', padding: '1.2rem', fontSize: '1rem' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        {isMinting ? 'Negotiating with Ledger...' : 'Secure Record On-Chain'}
                    </button>
                </div>
            </div>

            {confidenceScore < 75 && (
                <div className="glass" style={{ padding: '1.5rem 3rem', borderRadius: '15px', border: '1px solid #FF003C', color: '#FF003C', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    ⚠️ Analysis Suspended due to Image Quality
                </div>
            )}

            <p style={{ color: '#444', fontSize: '0.75rem', maxWidth: '500px', textAlign: 'center' }}>
                This action will mint your AI-extracted diagnostic data to the Uronexa Health Ledger, creating an immutable cryptographic record.
            </p>
        </div>
    );
};

export default MintingDashboard;
