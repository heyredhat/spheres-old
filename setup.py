import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="spheres", 
    version="0.0.1",
    author="Matthew Weiss",
    author_email="heyredhat@gmail.com",
    description="",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/heyredhat",
    packages=setuptools.find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: GNU General Public License v3 (GPLv3)",
        "Operating System :: OS Independent",
    ],
    install_requires=["flask", "python-socketio", "eventlet",\
        "termcolor", "sympy", "numpy", "qutip"]
    python_requires=">=3.8",
)