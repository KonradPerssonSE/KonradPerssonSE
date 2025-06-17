const io = new IntersectionObserver(
  entries => {
    entries.forEach(el => {
      if (el.isIntersecting) {
        el.target.classList.add('reveal');
        io.unobserve(el.target);
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.animate').forEach(s => io.observe(s));
