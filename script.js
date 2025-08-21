// DOM要素を取得
const incomeTypeRadios = document.querySelectorAll('input[name="incomeType"]');
const incomeSlider = document.getElementById("incomeSlider");
const coinSlider = document.getElementById("coinSlider");
const incomeTypeLabel = document.getElementById("incomeTypeLabel"); // 追加
const incomeLabel = document.getElementById("incomeLabel");
const coinLabel = document.getElementById("coinLabel");
const resultDisplay = document.getElementById("resultDisplay");

/**
 * 金額をフォーマットして表示するヘルパー関数
 * @param {number} amount - フォーマットする金額
 * @returns {string} フォーマットされた文字列
 */
const formatCurrency = (amount) => {
	// 日本円のロケール設定
	const formatter = new Intl.NumberFormat("ja-JP", {
		style: "currency",
		currency: "JPY",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	});
	return formatter.format(amount);
};

// 計算ロジック
const coinAndTaxable = (webcoin, taxableIncome) => {
	if (webcoin < 500000) {
		// 500,000円未満は税金なし
		const taxDetails = getTaxDetails(taxableIncome);
		return {
			totalTax: taxableIncome * (taxDetails.rate / 100) - taxDetails.deduction,
			coinTax: 0,
			underFive: true, // 500,000円未満のフラグを追加
		};
	}
	webcoin = webcoin - 500000;
	getTaxDetails(taxableIncome + webcoin / 2);
	const taxDetails = getTaxDetails(taxableIncome);
	return {
		totalTax: taxableIncome * (taxDetails.rate / 100) - taxDetails.deduction,
		coinTax: webcoin * (taxDetails.rate / 100),
	};
};

// 課税所得から税率と控除額を取得する関数
function getTaxDetails(taxable) {
	if (taxable >= 1000 && taxable <= 1949000) {
		return {
			rate: 5,
			deduction: 0,
		};
	} else if (taxable >= 1950000 && taxable <= 3299000) {
		return {
			rate: 10,
			deduction: 97500,
		};
	} else if (taxable >= 3300000 && taxable <= 6949000) {
		return {
			rate: 20,
			deduction: 427500,
		};
	} else if (taxable >= 6950000 && taxable <= 8999000) {
		return {
			rate: 23,
			deduction: 636000,
		};
	} else if (taxable >= 9000000 && taxable <= 17999000) {
		return {
			rate: 33,
			deduction: 1536000,
		};
	} else if (taxable >= 18000000 && taxable <= 39999000) {
		return {
			rate: 40,
			deduction: 2796000,
		};
	} else if (taxable >= 40000000) {
		return {
			rate: 45,
			deduction: 4796000,
		};
	} else {
		// 1000円未満の場合
		return {
			rate: 0,
			deduction: 0,
		};
	}
}

const coinAndSalary = (webcoin, salaryIncome) => {
	// 給与所得控除を考慮
	let calculateedSalary = getSalaryAfterDeduction(salaryIncome);
	// 基礎控除を考慮
	calculateedSalary -= 480000; // 基礎控除
	// 社会保険料控除を考慮
	calculateedSalary -= getYearlySocialInsurance(salaryIncome);
	return coinAndTaxable(webcoin, calculateedSalary);
};

// シンプルに年間社会保険料のみを返すバージョン
function getYearlySocialInsurance(income) {
	const result = calculateSocialInsurance(income);
	return result.yearlyInsurance.total;
}

// 2025年度 東京都 社会保険料計算関数（40歳未満）
function calculateSocialInsurance(income) {
	// 月給計算（年収を14で割る）
	const monthlySalary = Math.floor(income / 14);

	// 標準報酬月額等級表（2025年度）から該当等級を求める
	const standardMonthlyWages = [
		{ grade: 1, amount: 88000, min: 63000, max: 93000 },
		{ grade: 2, amount: 98000, min: 93000, max: 101000 },
		{ grade: 3, amount: 104000, min: 101000, max: 107000 },
		{ grade: 4, amount: 110000, min: 107000, max: 114000 },
		{ grade: 5, amount: 118000, min: 114000, max: 122000 },
		{ grade: 6, amount: 126000, min: 122000, max: 130000 },
		{ grade: 7, amount: 134000, min: 130000, max: 138000 },
		{ grade: 8, amount: 142000, min: 138000, max: 146000 },
		{ grade: 9, amount: 150000, min: 146000, max: 155000 },
		{ grade: 10, amount: 160000, min: 155000, max: 165000 },
		{ grade: 11, amount: 170000, min: 165000, max: 175000 },
		{ grade: 12, amount: 180000, min: 175000, max: 185000 },
		{ grade: 13, amount: 190000, min: 185000, max: 195000 },
		{ grade: 14, amount: 200000, min: 195000, max: 210000 },
		{ grade: 15, amount: 220000, min: 210000, max: 230000 },
		{ grade: 16, amount: 240000, min: 230000, max: 250000 },
		{ grade: 17, amount: 260000, min: 250000, max: 270000 },
		{ grade: 18, amount: 280000, min: 270000, max: 290000 },
		{ grade: 19, amount: 300000, min: 290000, max: 310000 },
		{ grade: 20, amount: 320000, min: 310000, max: 330000 },
		{ grade: 21, amount: 340000, min: 330000, max: 350000 },
		{ grade: 22, amount: 360000, min: 350000, max: 370000 },
		{ grade: 23, amount: 380000, min: 370000, max: 395000 },
		{ grade: 24, amount: 410000, min: 395000, max: 425000 },
		{ grade: 25, amount: 440000, min: 425000, max: 455000 },
		{ grade: 26, amount: 470000, min: 455000, max: 485000 },
		{ grade: 27, amount: 500000, min: 485000, max: 515000 },
		{ grade: 28, amount: 530000, min: 515000, max: 545000 },
		{ grade: 29, amount: 560000, min: 545000, max: 575000 },
		{ grade: 30, amount: 590000, min: 575000, max: 605000 },
		{ grade: 31, amount: 620000, min: 605000, max: 635000 },
	];

	// 標準報酬月額を決定
	let standardWage = 620000; // デフォルトは最高額
	for (const wage of standardMonthlyWages) {
		if (monthlySalary >= wage.min && monthlySalary < wage.max) {
			standardWage = wage.amount;
			break;
		}
	}

	// 2025年度料率（東京都、40歳未満）
	const healthInsuranceRate = 0.0998; // 協会けんぽ東京支部
	const pensionRate = 0.183; // 厚生年金保険
	const employmentInsuranceRate = 0.0055; // 雇用保険（労働者負担分）

	// 月額保険料計算（労働者負担分）
	const monthlyHealthInsurance = Math.floor(
		(standardWage * healthInsuranceRate) / 2
	);
	const monthlyPension = Math.floor((standardWage * pensionRate) / 2);
	const monthlyEmploymentInsurance = Math.floor(
		(income * employmentInsuranceRate) / 12
	);

	const monthlyTotal =
		monthlyHealthInsurance + monthlyPension + monthlyEmploymentInsurance;
	const yearlyTotal = monthlyTotal * 12;

	return {
		income: income,
		monthlySalary: monthlySalary,
		standardWage: standardWage,
		monthlyInsurance: {
			healthInsurance: monthlyHealthInsurance,
			pension: monthlyPension,
			employmentInsurance: monthlyEmploymentInsurance,
			total: monthlyTotal,
		},
		yearlyInsurance: {
			healthInsurance: monthlyHealthInsurance * 12,
			pension: monthlyPension * 12,
			employmentInsurance: monthlyEmploymentInsurance * 12,
			total: yearlyTotal,
		},
		rates: {
			healthInsuranceRate: healthInsuranceRate,
			pensionRate: pensionRate,
			employmentInsuranceRate: employmentInsuranceRate,
		},
	};
}

function getSalaryAfterDeduction(income) {
	let deduction = 0;

	if (income <= 1625000) {
		deduction = 550000;
	} else if (income <= 1799999) {
		deduction = income * 0.4 - 100000;
	} else if (income <= 3599999) {
		deduction = income * 0.3 + 80000;
	} else if (income <= 6599999) {
		deduction = income * 0.2 + 440000;
	} else if (income <= 8499999) {
		deduction = income * 0.1 + 1100000;
	} else {
		deduction = 1950000;
	}

	return Math.max(0, income - deduction);
}

// UIと計算を同期させるメイン関数
const updateCalculation = () => {
	const webcoin = parseInt(coinSlider.value, 10);
	const income = parseInt(incomeSlider.value, 10);
	const selectedIncomeType = document.querySelector(
		'input[name="incomeType"]:checked'
	).value;

	let result = 0;
	if (selectedIncomeType === "taxableIncome") {
		result = coinAndTaxable(webcoin, income);
		// ラベルを更新
		incomeTypeLabel.textContent = "課税所得";
	} else {
		result = coinAndSalary(webcoin, income);
		// ラベルを更新
		incomeTypeLabel.textContent = "給与所得";
	}

	// スライダーのラベルを更新
	incomeLabel.textContent = formatCurrency(income);
	coinLabel.textContent = formatCurrency(webcoin);

	const resultTotalTax = result.totalTax;
	const resultCoinTax = result.coinTax;

	// 結果を表示
	resultDisplayTotal.textContent = `所得税目安: ${formatCurrency(
		resultTotalTax
	)}`;
	// 結果を表示
	if (result.underFive) {
		resultDisplayCoin.textContent =
			"50万円以下のコイン収益に税は発生しません。";
	} else {
		resultDisplayCoin.textContent = `内、コイン税: ${formatCurrency(
			resultCoinTax
		)}`;
	}
};

// イベントリスナーを設定
// ラジオボタン、スライダーが変更されるたびに計算を更新
incomeTypeRadios.forEach((radio) =>
	radio.addEventListener("change", updateCalculation)
);
incomeSlider.addEventListener("input", updateCalculation);
coinSlider.addEventListener("input", updateCalculation);

// 初期表示の計算を実行
window.onload = updateCalculation;
