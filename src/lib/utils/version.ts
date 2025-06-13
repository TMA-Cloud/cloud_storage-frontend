export function compareVersions(a: string, b: string): number {
	const as = a.split('.').map((v) => parseInt(v, 10) || 0);
	const bs = b.split('.').map((v) => parseInt(v, 10) || 0);
	const len = Math.max(as.length, bs.length);
	for (let i = 0; i < len; i++) {
		const ai = as[i] ?? 0;
		const bi = bs[i] ?? 0;
		if (ai < bi) return -1;
		if (ai > bi) return 1;
	}
	return 0;
}
