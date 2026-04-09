module.exports = {
  easy: [
    {
      question: "What is Java and why is it platform-independent?",
      answer:
        "Java is a high-level, object-oriented programming language designed for portability and security. It is platform-independent because Java code is compiled into bytecode, which runs on the Java Virtual Machine (JVM). Since JVM is available for different operating systems, the same compiled code can run anywhere without modification.",
    },
    {
      question: "Explain the difference between JDK, JRE, and JVM.",
      answer:
        "JDK (Java Development Kit) is a complete package used for developing Java applications, including tools like compiler and debugger. JRE (Java Runtime Environment) provides libraries and environment to run Java programs. JVM (Java Virtual Machine) executes bytecode. In simple terms, JDK = development, JRE = runtime, JVM = execution engine.",
    },
    {
      question: "What are the 8 primitive data types in Java?",
      answer:
        "Java has eight primitive data types: byte, short, int, long, float, double, char, and boolean. These are basic building blocks for storing simple values like numbers, characters, and true/false conditions. They are not objects and are stored directly in memory, making them faster and more memory efficient compared to reference types.",
    },
    {
      question: "What is a Class and an Object?",
      answer:
        "A class is a blueprint or template used to create objects. It defines properties (variables) and behaviors (methods). An object is an instance of a class, representing a real-world entity. For example, a 'Car' class defines attributes, while a specific car object like 'BMW' is created using that class.",
    },
    {
      question: "Explain the 'static' keyword in Java.",
      answer:
        "The static keyword is used for memory management and indicates that a variable or method belongs to the class rather than an instance. Static members are shared among all objects of the class. For example, static methods can be called without creating an object, making them useful for utility functions.",
    },
    {
      question: "What is the difference between '==' and '.equals()'?",
      answer:
        "The '==' operator compares references (memory addresses) of two objects, meaning it checks if both variables point to the same object. The '.equals()' method compares the actual content or value inside objects. For example, in strings, equals() checks text equality while == checks if both references are identical.",
    },
    {
      question: "What are Constructors and why are they used?",
      answer:
        "Constructors are special methods in Java used to initialize objects when they are created. They have the same name as the class and do not have a return type. Constructors help set initial values for object properties, ensuring objects are properly initialized before use in the program.",
    },
    {
      question: "What is an Array in Java and how is it declared?",
      answer:
        "An array in Java is a collection of elements of the same data type stored in contiguous memory locations. It is declared using square brackets. For example, int[] arr = new int[5]; creates an array of size five. Arrays are useful for storing multiple values under a single variable name.",
    },
    {
      question: "What is the use of the 'final' keyword?",
      answer:
        "The final keyword is used to restrict modification. A final variable cannot be reassigned, a final method cannot be overridden, and a final class cannot be inherited. It is commonly used to define constants and ensure immutability in programs, improving security and reliability of the code.",
    },
    {
      question:
        "What are Access Modifiers (public, private, protected, default)?",
      answer:
        "Access modifiers control the visibility of classes, methods, and variables. Public allows access from anywhere, private restricts access within the same class, protected allows access within the same package and subclasses, and default allows access within the same package only. They help enforce encapsulation and data security.",
    },
  ],

  moderate: [
    {
      question: "Explain the 4 pillars of OOP.",
      answer:
        "The four pillars of Object-Oriented Programming are Encapsulation, Inheritance, Polymorphism, and Abstraction. Encapsulation hides data using access modifiers. Inheritance allows one class to reuse another. Polymorphism enables methods to behave differently. Abstraction hides implementation details and shows only essential features to the user.",
    },
    {
      question:
        "What is the difference between an Abstract Class and an Interface?",
      answer:
        "An abstract class can have both abstract and concrete methods, while an interface only contains abstract methods (until Java 8 added default methods). A class can extend only one abstract class but implement multiple interfaces. Interfaces are mainly used for achieving multiple inheritance and defining contracts.",
    },
    {
      question: "Explain Method Overloading vs. Method Overriding.",
      answer:
        "Method overloading occurs when multiple methods have the same name but different parameters within the same class. Method overriding happens when a subclass provides a specific implementation of a method already defined in the parent class. Overloading is compile-time polymorphism, while overriding is runtime polymorphism.",
    },
    {
      question: "What is the Java Collections Framework?",
      answer:
        "The Java Collections Framework is a set of classes and interfaces used to store and manipulate groups of data. It includes List, Set, and Map. Lists allow duplicates, Sets do not allow duplicates, and Maps store key-value pairs. It provides efficient data handling and utility methods.",
    },
    {
      question: "How does Exception Handling work?",
      answer:
        "Exception handling in Java is done using try, catch, and finally blocks. Code that may cause an exception is placed in try. If an error occurs, it is caught in catch. The finally block executes regardless of exception. This mechanism prevents program crashes and ensures smooth execution.",
    },
    {
      question:
        "What is the difference between checked and unchecked exceptions?",
      answer:
        "Checked exceptions are checked at compile time and must be handled using try-catch or declared with throws, such as IOException. Unchecked exceptions occur at runtime and are not mandatory to handle, such as NullPointerException. Checked exceptions ensure safer code, while unchecked provide flexibility.",
    },
    {
      question: "Explain Wrapper Classes and Autoboxing.",
      answer:
        "Wrapper classes convert primitive data types into objects. For example, int becomes Integer. Autoboxing automatically converts primitives to wrapper objects, while unboxing converts objects back to primitives. This is useful when working with collections, as they store objects rather than primitive types.",
    },
    {
      question: "What is a String Pool in Java?",
      answer:
        "The String Pool is a special memory area where Java stores string literals. If two strings have the same value, they reference the same memory location. This improves memory efficiency and performance. Strings created using 'new' keyword are stored outside the pool.",
    },
    {
      question: "What is the purpose of 'super' and 'this'?",
      answer:
        "'this' refers to the current object and is used to access instance variables or methods. 'super' refers to the parent class object and is used to call parent class methods or constructors. Both help manage inheritance and resolve naming conflicts.",
    },
    {
      question: "Explain ArrayList vs LinkedList.",
      answer:
        "ArrayList uses a dynamic array and provides fast random access but slower insertion and deletion. LinkedList uses nodes connected by pointers, allowing fast insertion and deletion but slower access. ArrayList is better for read-heavy operations, while LinkedList suits frequent modifications.",
    },
  ],

  hard: [
    {
      question: "How does Garbage Collection work in Java?",
      answer:
        "Garbage Collection automatically removes unused objects from memory to prevent memory leaks. The JVM identifies objects that are no longer referenced and deletes them. It runs in the background and uses algorithms like Mark and Sweep to free memory efficiently without manual intervention.",
    },
    {
      question: "Explain the Java Memory Model.",
      answer:
        "The Java Memory Model divides memory into Heap and Stack. Heap stores objects and is shared across threads, while Stack stores method calls and local variables for each thread. Proper memory management ensures thread safety and avoids concurrency issues.",
    },
    {
      question: "What are Lambda Expressions?",
      answer:
        "Lambda expressions provide a concise way to implement functional interfaces. They allow writing code in a functional style using syntax like (parameters) -> expression. Introduced in Java 8, they improve readability and reduce boilerplate code, especially in collections and streams.",
    },
    {
      question: "Explain HashMap working.",
      answer:
        "HashMap stores data as key-value pairs. It uses hashing to determine where to store entries. Keys are converted into hash codes, which map to buckets. In case of collisions, it uses linked lists or trees. It provides fast retrieval, insertion, and deletion operations.",
    },
    {
      question: "What is Multithreading?",
      answer:
        "Multithreading allows multiple threads to run concurrently within a program. It improves performance and resource utilization. Threads can be created by extending Thread class or implementing Runnable interface. Proper synchronization is required to avoid data inconsistency.",
    },
    {
      question: "Explain Synchronization and volatile.",
      answer:
        "Synchronization ensures that only one thread accesses a resource at a time, preventing race conditions. The volatile keyword ensures visibility of changes across threads by preventing caching. Both are important for thread-safe programming in Java.",
    },
    {
      question: "What is Reflection API?",
      answer:
        "Reflection API allows a program to inspect and modify its own structure at runtime. It can access private fields, methods, and constructors. It is used in frameworks, debugging tools, and libraries but should be used carefully due to performance and security concerns.",
    },
    {
      question: "Explain Diamond Problem.",
      answer:
        "The diamond problem occurs in multiple inheritance when a class inherits from two classes that have a common parent. Java avoids this issue by not supporting multiple inheritance with classes. However, it allows multiple inheritance using interfaces.",
    },
    {
      question: "What are Generics?",
      answer:
        "Generics allow classes, interfaces, and methods to operate on specific data types while providing compile-time type safety. They eliminate the need for casting and reduce runtime errors. For example, List<String> ensures only strings are stored.",
    },
    {
      question: "What is fail-fast vs fail-safe iterator?",
      answer:
        "Fail-fast iterators throw exceptions if a collection is modified during iteration, ensuring data consistency. Fail-safe iterators work on a copy of the collection and do not throw exceptions. Fail-fast is faster, while fail-safe is safer in concurrent environments.",
    },
  ],
};
