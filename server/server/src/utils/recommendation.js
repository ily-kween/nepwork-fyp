const normalizeTags = (tags = []) =>
    [...new Set((Array.isArray(tags) ? tags : [])
        .map((tag) => String(tag ?? "").trim().toLowerCase())
        .filter(Boolean))];

const getSharedTags = (left = [], right = []) => {
    const leftTags = normalizeTags(left);
    const rightTags = new Set(normalizeTags(right));
    return leftTags.filter((tag) => rightTags.has(tag));
};

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const toPlainRecord = (record) => {
    if (!record) return record;
    if (typeof record.toObject === "function") return record.toObject();
    return record;
};

const scoreRateFit = (preferredRate, candidateRate) => {
    const preferred = Number(preferredRate || 0);
    const candidate = Number(candidateRate || 0);

    if (!preferred || !candidate) return 0;
    if (candidate <= preferred) {
        const gap = preferred - candidate;
        return 18 - Math.min(10, (gap / preferred) * 18);
    }

    const overshoot = candidate - preferred;
    return Math.max(0, 18 - Math.min(18, (overshoot / preferred) * 24));
};

export const scoreFreelancerForJobs = ({ freelancer, jobs = [] }) => {
    const normalizedJobs = Array.isArray(jobs) ? jobs : [];
    const freelancerTags = normalizeTags(freelancer?.tags || []);

    if (normalizedJobs.length === 0) {
        const baselineScore = (freelancer?.kycVerified ? 10 : 0) + (freelancer?.available ? 8 : 0) + Math.min(12, Number(freelancer?.rating || 0) * 2);
        return {
            recommendationScore: clampScore(baselineScore),
            matchedJobId: null,
            matchedJobTitle: null,
            matchedTags: [],
            matchReasons: [
                freelancer?.kycVerified ? "Verified profile" : null,
                freelancer?.available ? "Available for work" : null,
                freelancer?.rating ? `Rating ${freelancer.rating.toFixed?.(1) ?? freelancer.rating}` : null,
            ].filter(Boolean),
            matchedJobsCount: 0,
        };
    }

    const jobMatches = normalizedJobs.map((job) => {
        const jobTags = normalizeTags(job?.tags || []);
        const matchedTags = getSharedTags(freelancerTags, jobTags);
        const tagScore = matchedTags.length * 28;
        const rateScore = scoreRateFit(job?.hourlyRate, freelancer?.hourlyRate);
        const ratingScore = Math.min(15, Number(freelancer?.rating || 0) * 3);
        const availabilityScore = freelancer?.available ? 8 : -10;
        const kycScore = freelancer?.kycVerified ? 8 : 0;
        const recencyScore = job?.createdAt ? Math.max(0, 6 - Math.min(6, Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 7)))) : 0;

        const score = clampScore(tagScore + rateScore + ratingScore + availabilityScore + kycScore + recencyScore);
        const matchReasons = [
            matchedTags.length > 0 ? `Matches ${matchedTags.join(", ")}` : null,
            rateScore > 0 ? "Budget aligned" : null,
            freelancer?.kycVerified ? "KYC verified" : null,
            freelancer?.available ? "Available now" : null,
        ].filter(Boolean);

        return {
            jobId: job?._id?.toString?.() || null,
            jobTitle: job?.title || null,
            recommendationScore: score,
            matchedTags,
            matchReasons,
        };
    });

    const bestMatch = jobMatches.sort((a, b) => b.recommendationScore - a.recommendationScore)[0];
    const matchedJobs = jobMatches.filter((match) => match.matchedTags.length > 0);

    return {
        recommendationScore: bestMatch?.recommendationScore || 0,
        matchedJobId: bestMatch?.jobId || null,
        matchedJobTitle: bestMatch?.jobTitle || null,
        matchedTags: bestMatch?.matchedTags || [],
        matchReasons: bestMatch?.matchReasons || [],
        matchedJobsCount: matchedJobs.length,
    };
};

export const scoreJobForFreelancer = ({ job, freelancer }) => {
    const jobTags = normalizeTags(job?.tags || []);
    const freelancerTags = normalizeTags(freelancer?.tags || []);
    const matchedTags = getSharedTags(jobTags, freelancerTags);
    const tagScore = matchedTags.length * 30;
    const rateScore = scoreRateFit(freelancer?.hourlyRate, job?.hourlyRate);
    const availabilityScore = freelancer?.available ? 8 : -10;
    const ratingScore = Math.min(12, Number(freelancer?.rating || 0) * 2.5);
    const kycScore = freelancer?.kycVerified ? 8 : 0;
    const recencyScore = job?.createdAt ? Math.max(0, 8 - Math.min(8, Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 7)))) : 0;

    const recommendationScore = clampScore(tagScore + rateScore + availabilityScore + ratingScore + kycScore + recencyScore);

    return {
        recommendationScore,
        matchedTags,
        matchReasons: [
            matchedTags.length > 0 ? `Matches ${matchedTags.join(", ")}` : null,
            rateScore > 0 ? "Budget fits your rate" : null,
            freelancer?.kycVerified ? "KYC verified" : null,
            freelancer?.available ? "Available now" : null,
        ].filter(Boolean),
    };
};

export const rankFreelancersForJobs = (freelancers = [], jobs = []) =>
    (Array.isArray(freelancers) ? freelancers : []).map((freelancer) => {
        const plainFreelancer = toPlainRecord(freelancer);
        return {
        ...plainFreelancer,
        recommendation: scoreFreelancerForJobs({ freelancer, jobs }),
        };
    }).sort((left, right) => (right.recommendation?.recommendationScore || 0) - (left.recommendation?.recommendationScore || 0));

export const rankJobsForFreelancer = (jobs = [], freelancer = {}) =>
    (Array.isArray(jobs) ? jobs : []).map((job) => {
        const plainJob = toPlainRecord(job);
        return {
        ...plainJob,
        recommendation: scoreJobForFreelancer({ job, freelancer }),
        };
    }).sort((left, right) => (right.recommendation?.recommendationScore || 0) - (left.recommendation?.recommendationScore || 0));
