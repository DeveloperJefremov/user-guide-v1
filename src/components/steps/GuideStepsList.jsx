import { Reorder } from 'framer-motion';
import { useEffect, useState } from 'react';
import Button from '../../UI/Button';
import Modal from '../../UI/Modal';
import GuideStep from './GuideStep';
import GuideStepForm from './GuideStepForm';
import styles from './GuideStepsList.module.css';

const initialFormData = {
	title: '',
	description: '',
	order: '',
	pageUrl: '',
	elementId: '',
	imgChecked: false,
	imgWidth: 0,
	imgHeight: 0,
	imageUrl: '',
};

export default function GuideStepsList({
	mode,
	onModeChange,
	steps: initialSteps,
	guideSetId,
	activeGuideSetId,
	isGuideModalOpen,
}) {
	const [steps, setSteps] = useState(initialSteps || []);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentStepIndex, setCurrentStepIndex] = useState(0); // Для хранения индекса редактируемого шага
	const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 }); // Позиция модального окна

	const [formData, setFormData] = useState(initialFormData);

	useEffect(() => {
		console.log('index - ', currentStepIndex);
	}, [currentStepIndex]);

	// Создание нового шага
	const handleCreateStep = () => {
		setFormData(initialFormData); // Очищаем данные формы
		onModeChange('create'); // Устанавливаем режим создания
		setIsModalOpen(true); // Открываем модальное окно
	};

	// Сохранение нового шага
	const handleSaveStep = () => {
		if (mode === 'create') {
			// Проверка на дублирование order
			const isDuplicateOrder = steps.some(
				step => step.order === formData.order
			);

			let updatedSteps = [...steps];
			if (isDuplicateOrder) {
				// Если дублируется, сдвигаем все шаги с таким order и выше
				updatedSteps = steps.map(step =>
					step.order >= formData.order
						? { ...step, order: step.order + 1 }
						: step
				);
			}

			const newStep = {
				...formData,
				id: String(steps.length + 1),
				order: Number(formData.order),
			};

			setSteps([...updatedSteps, newStep].sort((a, b) => a.order - b.order)); // Сортируем по order
			setIsModalOpen(false);
			setFormData(initialFormData);
		} else if (mode === 'edit') {
			const updatedSteps = steps.map((step, index) =>
				index === currentStepIndex ? { ...step, ...formData } : step
			);

			// Проверка на дублирование order
			const isDuplicateOrder = updatedSteps.some(
				(step, index) =>
					step.order === formData.order && index !== currentStepIndex
			);

			if (isDuplicateOrder) {
				// Если дублируется, сдвигаем все шаги с таким order и выше
				const reorderedSteps = updatedSteps.map(step =>
					step.order >= formData.order && step.id !== steps[currentStepIndex].id
						? { ...step, order: step.order - 1 }
						: step
				);

				setSteps(reorderedSteps.sort((a, b) => a.order - b.order)); // Сортируем по order
			} else {
				setSteps(updatedSteps.sort((a, b) => a.order - b.order)); // Сортируем по order
			}

			setIsModalOpen(false);
			setCurrentStepIndex(0);
		}
	};

	// Удаление шага
	const handleDeleteStep = stepIndex => {
		const updatedSteps = steps.filter((_, index) => index !== stepIndex);
		setSteps(updatedSteps); // Обновляем шаги в состоянии

		// Обновляем currentStepIndex, чтобы не выйти за пределы массива
		if (currentStepIndex >= updatedSteps.length) {
			setCurrentStepIndex(updatedSteps.length - 1);
		}
	};

	const handleFormChange = newFormData => {
		setFormData(newFormData); // Обновляем данные формы
	};

	const handleEditStep = stepIndex => {
		const selectedStep = steps[stepIndex]; // Получаем данные выбранного шага
		setFormData(selectedStep); // Заполняем форму данными редактируемого шага
		setCurrentStepIndex(stepIndex); // Запоминаем индекс редактируемого шага
		onModeChange('edit'); // Устанавливаем режим редактирования
		setIsModalOpen(true); // Открываем модальное окно
	};

	// Сохранение нового шага или редактирование существующего

	const handleCancel = () => {
		setIsModalOpen(false); // Закрываем окно
		setFormData(initialFormData);
		setCurrentStepIndex(0); // Сбрасываем текущий индекс
		onModeChange('display');
	};

	// Переход на следующий шаг
	const handleNext = () => {
		if (currentStepIndex < steps.length - 1) {
			setCurrentStepIndex(prev => prev + 1);
		}
	};

	// Переход на предыдущий шаг
	const handlePrevious = () => {
		if (currentStepIndex > 0) {
			setCurrentStepIndex(prev => prev - 1);
		}
	};

	// Функция для выделения элемента
	const highlightElement = elementId => {
		const element = document.getElementById(elementId); // Найти элемент по ID
		if (element) {
			element.classList.add(styles.highlight); // Добавить класс для выделения из модуля
			const rect = element.getBoundingClientRect(); // Получаем координаты элемента
			setModalPosition({
				top: rect.top + window.scrollY,
				left: rect.left + window.scrollX + rect.width + 10, // Модальное окно справа от элемента
			});
		}
	};

	// Функция для снятия выделения с элемента
	const removeHighlightElement = elementId => {
		const element = document.getElementById(elementId); // Найти элемент по ID
		if (element) {
			element.classList.remove(styles.highlight); // Убрать класс выделения
		}
	};

	useEffect(() => {
		// Когда шаг меняется и если у шага есть elementId и набор активен, выделяем элемент
		if (
			mode === 'execute' &&
			activeGuideSetId === guideSetId && // Проверяем, является ли этот набор активным
			steps[currentStepIndex]?.elementId
		) {
			highlightElement(steps[currentStepIndex].elementId);
		}

		return () => {
			if (steps[currentStepIndex]?.elementId) {
				removeHighlightElement(steps[currentStepIndex].elementId);
			}
		};
	}, [currentStepIndex, mode, steps, activeGuideSetId, guideSetId]);

	return (
		<div className={styles.guideStepsList}>
			<header className={styles.guideStepsList__header}>
				<section className={styles.guideSetsList__createSection}>
					<h2>Create New Lesson</h2>
					<Button size='lg' variant='lightGrey' onClick={handleCreateStep}>
						Add: Lesson
					</Button>

					{isModalOpen && (
						<Modal onClick={handleCancel}>
							<GuideStepForm
								data={formData}
								mode={mode}
								onChange={handleFormChange}
								handleSaveStep={handleSaveStep}
								handleCancel={handleCancel}
							/>
						</Modal>
					)}
				</section>

				<h2>Guide Steps List:</h2>
			</header>
			<ul className={styles.guideStepsList__stepsList}>
				<Reorder.Group
					values={steps}
					onReorder={steps => {
						const updatedSteps = steps.map((step, index) => {
							const newStep = {
								...step,
								order: index + 1,
							};
							return newStep;
						});

						setSteps(updatedSteps);
					}}
				>
					{steps.map((step, stepIndex) => {
						return (
							<Reorder.Item
								key={step.id}
								value={step}
								className={styles.fontList}
							>
								{/* <li className={styles.fontList}> */}
								<GuideStep
									// key={`step-${step.id}`}
									step={step}
									handleEditStep={() => handleEditStep(stepIndex)}
									handleDeleteStep={() => handleDeleteStep(stepIndex)}
								/>
								{/* </li> */}
							</Reorder.Item>
						);
					})}
				</Reorder.Group>
			</ul>

			{isGuideModalOpen &&
				mode === 'execute' &&
				activeGuideSetId === guideSetId &&
				steps[currentStepIndex] && (
					<Modal
						style={{
							position: 'absolute',
							top: `${modalPosition.top}px`,
							left: `${modalPosition.left}px`,
						}}
					>
						<h3>{steps[currentStepIndex]?.title}</h3>
						{steps[currentStepIndex]?.imageUrl && (
							<img
								src={steps[currentStepIndex].imageUrl}
								alt={steps[currentStepIndex].title}
								width={steps[currentStepIndex].imgWidth}
								height={steps[currentStepIndex].imgHeight}
							/>
						)}
						<p>{steps[currentStepIndex]?.description}</p>
						<p>Total Steps: {`${currentStepIndex + 1} of ${steps.length}`}</p>
						<Button onClick={handlePrevious} disabled={currentStepIndex === 0}>
							Previous
						</Button>
						<Button variant='lightGrey' onClick={handleCancel}>
							Close
						</Button>
						<Button
							onClick={handleNext}
							disabled={currentStepIndex === steps.length - 1}
						>
							Next
						</Button>
					</Modal>
				)}
		</div>
	);
}
