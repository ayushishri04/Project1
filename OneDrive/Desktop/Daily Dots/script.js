const tasks = document.querySelectorAll('.task');
const slots = document.querySelectorAll('.slot');

tasks.forEach(task => {
  task.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', e.target.dataset.task);
  });
});

slots.forEach(slot => {
  slot.addEventListener('dragover', (e) => {
    e.preventDefault();
    slot.style.backgroundColor = '#e8f5e9';
  });

  slot.addEventListener('dragleave', () => {
    slot.style.backgroundColor = '#fff';
  });

  slot.addEventListener('drop', (e) => {
    e.preventDefault();
    const taskName = e.dataTransfer.getData('text/plain');
    slot.innerText = `${slot.dataset.time}:00 - ${taskName}`;
    slot.classList.add('filled');

    // Simple Reminder after X seconds (demo)
    setTimeout(() => {
      alert(`Reminder: ${taskName} at ${slot.dataset.time}:00`);
    }, 5000); // Reminder in 5 sec

    // Mark recurring task (repeat every day at same time - logic placeholder)
    console.log(`Recurring task '${taskName}' set for ${slot.dataset.time}:00`);
  });
});
